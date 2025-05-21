/**
 * Parametry konfiguracji modelu LLM
 */
export interface ModelParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * Schemat JSON dla formatowania odpowiedzi
 */
export interface JsonSchemaFormat {
  name: string;
  strict: boolean;
  schema: Record<string, unknown>;
}

/**
 * Format odpowiedzi
 */
export interface ResponseFormat {
  type: "json_schema";
  json_schema: JsonSchemaFormat;
}

/**
 * Konfiguracja serwisu OpenRouter
 */
export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultParams?: ModelParams;
}

/**
 * Opcje dla metody sendMessage
 */
export interface SendMessageOptions {
  systemMessage: string;
  userMessage: string;
  modelName?: string;
  modelParams?: ModelParams;
  responseFormat?: ResponseFormat;
}

/**
 * Surowa odpowiedź z API OpenRouter
 */
export interface RawResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Przetworzona odpowiedź z API
 */
export type ParsedResponse = string | Record<string, unknown>;

/**
 * Payload żądania wysyłanego do API
 */
export interface RequestPayload {
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  response_format?: {
    type: string;
  };
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}
