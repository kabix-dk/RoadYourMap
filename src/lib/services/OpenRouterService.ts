import type {
  ResponseFormat,
  OpenRouterConfig,
  SendMessageOptions,
  RawResponse,
  ParsedResponse,
  RequestPayload,
} from "../utils/openrouter.types";
import { z } from "zod";

/**
 * Opcje mechanizmu ponawiania prób
 */
interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

/**
 * Serwis do komunikacji z OpenRouter API dla integracji z LLM
 */
export class OpenRouterService {
  private readonly httpClient: {
    fetch: (url: string, options: RequestInit) => Promise<Response>;
  };
  public readonly config: OpenRouterConfig;
  public lastResponse?: RawResponse;
  private readonly retryOptions: RetryOptions;

  /**
   * Tworzy nową instancję serwisu OpenRouter
   */
  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required");
    }

    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || "https://openrouter.ai/api/v1/chat/completions",
      defaultModel: config.defaultModel || "openai/gpt-4o-mini",
      defaultParams: config.defaultParams || { temperature: 0.7, max_tokens: 1024 },
    };

    // Inicjalizacja HTTP klienta z nagłówkiem Authorization
    this.httpClient = {
      fetch: (url: string, options: RequestInit) => {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        };

        return fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });
      },
    };

    // Konfiguracja mechanizmu ponawiania prób
    this.retryOptions = {
      maxRetries: 3,
      initialDelayMs: 1000,
      backoffMultiplier: 2,
      retryableStatusCodes: [429, 500, 502, 503, 504],
    };
  }

  /**
   * Wysyła wiadomość do API OpenRouter i zwraca przetworzoną odpowiedź
   */
  async sendMessage(options: SendMessageOptions): Promise<ParsedResponse> {
    return this.sendWithRetry(options, 0);
  }

  /**
   * Wysyła wiadomość z mechanizmem automatycznego ponawiania w przypadku błędów
   */
  private async sendWithRetry(options: SendMessageOptions, retryCount: number): Promise<ParsedResponse> {
    try {
      const payload = this.buildPayload(options);
      const baseUrl = this.config.baseUrl || "https://openrouter.ai/api/v1/chat/completions";

      // Debug log the payload
      console.log("OpenRouter API Request Payload:", JSON.stringify(payload, null, 2));

      const response = await this.httpClient.fetch(baseUrl, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Debug log for error responses
        const responseText = await response.text();
        console.error("OpenRouter API Error Response:", responseText);

        // Clone the response since we've consumed the body
        const clonedResponse = new Response(responseText, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });

        if (this.shouldRetry(response.status, retryCount)) {
          const delayMs = this.calculateBackoff(retryCount);
          console.warn(
            `Retrying request after ${delayMs}ms (attempt ${retryCount + 1}/${this.retryOptions.maxRetries})`
          );

          await this.delay(delayMs);
          return this.sendWithRetry(options, retryCount + 1);
        }

        await this.handleHttpError(clonedResponse);
      }

      const responseText = await response.text();
      try {
        // Parse and beautify JSON for logging
        const parsedJson = JSON.parse(responseText);
        console.log("OpenRouter API Success Response:", JSON.stringify(parsedJson, null, 2));
      } catch {
        // If we can't parse the JSON, log the raw text
        console.log("OpenRouter API Success Response (raw):", responseText);
      }

      const rawResponse = JSON.parse(responseText) as RawResponse;
      this.lastResponse = rawResponse;

      this.validateResponse(rawResponse);
      return this.parseResponse(rawResponse, options.responseFormat);
    } catch (error) {
      if (error instanceof Error && error.message.includes("network error") && this.shouldRetry(0, retryCount)) {
        const delayMs = this.calculateBackoff(retryCount);
        console.warn(
          `Network error, retrying after ${delayMs}ms (attempt ${retryCount + 1}/${this.retryOptions.maxRetries})`
        );

        await this.delay(delayMs);
        return this.sendWithRetry(options, retryCount + 1);
      }

      return this.handleError(error);
    }
  }

  /**
   * Sprawdza, czy powinniśmy ponowić próbę na podstawie kodu statusu i liczby wykonanych prób
   */
  private shouldRetry(statusCode: number, retryCount: number): boolean {
    return (
      retryCount < this.retryOptions.maxRetries &&
      (statusCode === 0 || this.retryOptions.retryableStatusCodes.includes(statusCode))
    );
  }

  /**
   * Oblicza czas oczekiwania (w ms) przed kolejną próbą, z użyciem eksponencjalnego backoff
   */
  private calculateBackoff(retryCount: number): number {
    return this.retryOptions.initialDelayMs * Math.pow(this.retryOptions.backoffMultiplier, retryCount);
  }

  /**
   * Czeka określony czas
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Buduje payload żądania na podstawie opcji i konfiguracji domyślnej
   */
  private buildPayload(options: SendMessageOptions): RequestPayload {
    const modelName = options.modelName || this.config.defaultModel || "openai/gpt-4o-mini";
    const modelParams = { ...this.config.defaultParams, ...options.modelParams };

    // Prepare user message - add "json" mention if using JSON response format
    let userMessage = options.userMessage;
    if (options.responseFormat?.type === "json_schema" && modelName.startsWith("openai/")) {
      userMessage = options.userMessage.includes("json")
        ? options.userMessage
        : `${options.userMessage} Respond with JSON.`;
    }

    const payload: RequestPayload = {
      model: modelName,
      messages: [
        { role: "system", content: options.systemMessage },
        { role: "user", content: userMessage },
      ],
      ...modelParams,
    };

    // Add response_format only if the model is from OpenAI and supports it
    if (options.responseFormat && options.responseFormat.type === "json_schema") {
      // OpenAI models expect response_format.type to be "json_object"
      if (modelName.startsWith("openai/")) {
        payload.response_format = { type: "json_object" };
      }
      // Other models like Anthropic may not support this parameter, so we don't set it
    }

    return payload;
  }

  /**
   * Waliduje odpowiedź z API
   */
  private validateResponse(response: RawResponse): void {
    if (!response.choices || response.choices.length === 0) {
      throw new Error("Invalid response: missing choices");
    }

    if (!response.choices[0].message || !response.choices[0].message.content) {
      throw new Error("Invalid response: missing message content");
    }
  }

  /**
   * Parsuje odpowiedź z API zgodnie z oczekiwanym formatem
   */
  private parseResponse(response: RawResponse, responseFormat?: ResponseFormat): ParsedResponse {
    const content = response.choices[0].message.content;

    if (!responseFormat) {
      return content;
    }

    try {
      if (responseFormat.type === "json_schema") {
        // Parsowanie JSON
        const parsedJson = JSON.parse(content) as Record<string, unknown>;
        console.log("Parsed JSON:", parsedJson);

        // Jeśli wymaga ścisłej walidacji, używamy Zod do weryfikacji schematu
        if (responseFormat.json_schema.strict) {
          try {
            // Konwersja schematu JSON na schemat Zod
            const schema = this.convertJsonSchemaToZod(responseFormat.json_schema.schema);

            // Walidacja
            const validatedData = schema.parse(parsedJson);
            return validatedData;
          } catch (validationError) {
            throw new Error(
              `Schemat JSON nie zgadza się: ${validationError instanceof Error ? validationError.message : String(validationError)}`
            );
          }
        }

        return parsedJson;
      }

      return content;
    } catch (error) {
      throw new Error(`Failed to parse response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Konwertuje schemat JSON na schemat Zod
   * @param schema Schemat JSON do konwersji
   * @returns Schemat Zod
   */
  private convertJsonSchemaToZod(schema: Record<string, unknown>): z.ZodTypeAny {
    // If it's not an object schema, return any
    if (!schema || typeof schema !== "object" || !("type" in schema)) {
      return z.any();
    }

    // Handle different types from JSON Schema
    const type = schema.type as string;

    switch (type) {
      case "object": {
        if (!schema.properties || typeof schema.properties !== "object") {
          return z.object({}).passthrough();
        }

        // Build object schema
        const properties = schema.properties as Record<string, unknown>;
        const requiredFields = Array.isArray(schema.required) ? (schema.required as string[]) : [];
        const shape: Record<string, z.ZodTypeAny> = {};

        // Process each property
        for (const [key, propSchema] of Object.entries(properties)) {
          const fieldSchema = this.inferZodTypeFromSchema(propSchema as Record<string, unknown>);
          shape[key] = requiredFields.includes(key) ? fieldSchema : fieldSchema.optional();
        }

        return z.object(shape);
      }

      case "array": {
        if (!schema.items) {
          return z.array(z.any());
        }
        const itemsSchema = this.inferZodTypeFromSchema(schema.items as Record<string, unknown>);
        return z.array(itemsSchema);
      }

      case "string":
        return z.string();

      case "number":
      case "integer":
        return z.number();

      case "boolean":
        return z.boolean();

      case "null":
        return z.null();

      default:
        return z.any();
    }
  }

  /**
   * Wnioskuje typ Zod na podstawie schematu
   */
  private inferZodTypeFromSchema(schema: Record<string, unknown>): z.ZodTypeAny {
    if (!schema || typeof schema !== "object") {
      return z.any();
    }

    if ("type" in schema) {
      const type = schema.type as string;

      switch (type) {
        case "object":
          return this.convertJsonSchemaToZod(schema);

        case "array":
          if (schema.items) {
            return z.array(this.inferZodTypeFromSchema(schema.items as Record<string, unknown>));
          }
          return z.array(z.any());

        case "string":
          return z.string();

        case "number":
        case "integer":
          return z.number();

        case "boolean":
          return z.boolean();

        case "null":
          return z.null();
      }
    }

    // Default fallback
    return z.any();
  }

  /**
   * Obsługuje błędy HTTP
   */
  private async handleHttpError(response: Response): Promise<never> {
    const status = response.status;
    let errorMessage: string;
    let responseBody: Record<string, unknown>;

    try {
      // If we're working with a cloned response from the debug block earlier
      let responseText: string;
      if (response.bodyUsed) {
        // Already consumed, try to get from the stored body
        const clonedBody = await response.text();
        responseText = clonedBody;
      } else {
        responseText = await response.text();
      }

      console.error("Error response body:", responseText);

      try {
        responseBody = JSON.parse(responseText);
        // Type assertion for the error shape
        const errorData = responseBody as { error?: { message?: string } };
        errorMessage = errorData.error?.message || `HTTP error ${status}`;
      } catch {
        // Not valid JSON
        errorMessage = responseText || `HTTP error ${status}`;
      }
    } catch {
      errorMessage = `HTTP error ${status}, could not parse response body`;
    }

    if (status === 401) {
      throw new Error(`Authentication error: Invalid API key or unauthorized access (${errorMessage})`);
    } else if (status === 429) {
      throw new Error(`Rate limit exceeded: Too many requests (${errorMessage})`);
    } else if (status >= 500) {
      throw new Error(`Server error: OpenRouter service is currently unavailable (${errorMessage})`);
    } else {
      throw new Error(`Request error: ${errorMessage}`);
    }
  }

  /**
   * Obsługuje ogólne błędy podczas przetwarzania żądania
   */
  private handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(`Unknown error: ${String(error)}`);
  }
}
