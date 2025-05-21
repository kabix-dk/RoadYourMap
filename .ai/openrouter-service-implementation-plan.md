# OpenRouter Service Implementation Guide

## 1. Opis usługi

Usługa `OpenRouterService` ma na celu ułatwienie integracji z API OpenRouter dla uzupełniania czatów opartych na LLM. Zapewnia:

- Konfigurację połączenia (klucz API, URL bazowy).
- Budowanie i wysyłanie żądań czatowych (wiadomości systemowe, użytkownika).
- Obsługę `response_format` (w tym schemat JSON).
- Zarządzanie modelem i jego parametrami.
- Walidację i parsowanie odpowiedzi.
- Centralne logowanie błędów i retry mechanizmy.

## 2. Opis konstruktora

```typescript
interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;             // domyślnie https://openrouter.ai/api/v1/chat/completions
  defaultModel?: string;        // np. "openai/gpt-4o"
  defaultParams?: ModelParams;  // temperatura, max_tokens itd.
}

class OpenRouterService {
  constructor(config: OpenRouterConfig) {
    // 1. Walidacja klucza API i opcjonalnych ustawień.
    // 2. Inicjalizacja HTTP clienta z nagłówkiem Authorization.
  }
}
```

### Parametry konstruktora

1. `apiKey` - klucz do API OpenRouter (zmienna środowiskowa).
2. `baseUrl` - URL endpointa.
3. `defaultModel` - domyślny model LLM.
4. `defaultParams` - domyślne parametry generacji.

## 3. Publiczne metody i pola

### sendMessage(options)

```typescript
interface SendMessageOptions {
  systemMessage: string;
  userMessage: string;
  modelName?: string;
  modelParams?: ModelParams;
  responseFormat?: ResponseFormat;
}

async sendMessage(options: SendMessageOptions): Promise<ParsedResponse>;
```

- Buduje payload z:
  1. `systemMessage` (np. "You are a helpful assistant.")
  2. `userMessage` (treść od użytkownika)
  3. `modelName` (np. "openai/gpt-4o")
  4. `modelParams` (np. `{ temperature: 0.7, max_tokens: 150 }`)
  5. `responseFormat`: 
     ```json
     { type: 'json_schema', json_schema: {
         name: 'JokeResponse',
         strict: true,
         schema: { joke: { type: 'string' } }
       }
     }
     ```
- Wysyła żądanie `POST` i zwraca sparsowaną odpowiedź.

### Publiczne pola

- `config: OpenRouterConfig`
- `lastResponse?: RawResponse`

## 4. Prywatne metody i pola

1. `buildPayload(options: SendMessageOptions): RequestPayload` – łączy opcje z domyślnymi ustawieniami.
2. `validateResponse(raw: RawResponse): void` – sprawdza status HTTP i strukturę JSON.
3. `parseResponse(raw: RawResponse): ParsedResponse` – mapuje dane na oczekiwany DTO.
4. `handleError(err: any): never` – wyrzuca spersonalizowane wyjątki.
5. `httpClient` – instancja fetch/axios z nagłówkami.

## 5. Obsługa błędów

1. Błąd autoryzacji (401) – brak/nieprawidłowy klucz API.
2. Błąd limitu (429) – zbyt wiele żądań, retry z backoff.
3. Błąd sieci (timeout, DNS) – ponów próbę i wyrzuć po max retry.
4. Błąd schematu (400) – niezgodne `responseFormat` lub request body.
5. Błąd serwera (5xx) – retry lub eskalacja.

## 6. Kwestie bezpieczeństwa

- Przechowywać `apiKey` w zmiennych środowiskowych, nigdy w repo.
- Ograniczyć logowanie: unikać logowania wrażliwych danych.

## 7. Plan wdrożenia krok po kroku

1. **Utworzenie pliku serwisu**
   - `src/lib/services/OpenRouterService.ts`
2. **Implementacja konstruktora**
   - Walidacja `apiKey`, ustawienia `httpClient`.
3. **Implementacja `sendMessage`**
   - Stwórz `buildPayload()`, wyślij żądanie, obsłuż błędy.
4. **Walidacja i parsowanie**
   - Użyj `zod` do walidacji ściśle zgodnie z `responseFormat`.

---

**Przykładowe użycie**

```typescript
const router = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultModel: 'openai/gpt-4o',
  defaultParams: { temperature: 0.7, max_tokens: 150 },
});

const result = await router.sendMessage({
  systemMessage: 'You are a helpful assistant.',
  userMessage: 'Opowiedz dowcip o kotach.',
  responseFormat: {
    type: 'json_schema',
    json_schema: {
      name: 'JokeResponse',
      strict: true,
      schema: { joke: { type: 'string' } }
    }
  }
});

console.log(result.joke);
``` 