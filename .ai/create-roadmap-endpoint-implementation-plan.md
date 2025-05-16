# API Endpoint Implementation Plan: POST /api/roadmaps

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia nowej roadmapy generowanej przez AI. Umożliwia użytkownikom definiowanie parametrów planu nauki oraz automatyczne generowanie struktury kroków.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- URL: `/api/roadmaps`
- Nagłówki:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Parametry:
  - Wymagane:
    - `title` (string)
    - `experience_level` (string)
    - `technology` (string)
    - `goals` (string)
  - Opcjonalne:
    - `additional_info` (string)
- Request Body:
  ```json
  {
    "title": "string",
    "experience_level": "string",
    "technology": "string",
    "goals": "string",
    "additional_info": "string"
  }
  ```

## 3. Wykorzystywane typy
- `CreateRoadmapCommand` (src/types.ts) – model wejściowy dla danych z żądania.
- `RoadmapDto` – DTO reprezentujący roadmapę bez pola `user_id`.
- `RoadmapDetailsDto` – rozszerzenie `RoadmapDto` zagnieżdżające pole `items: RoadmapItemDto[]`.
- `RoadmapItemDto` – DTO elementów roadmapy.
- `RoadmapItemRecordDto` – pełna definicja rekordu `roadmap_items` (opcjonalnie do zwrotu raw danych).

## 4. Szczegóły odpowiedzi
- Status: `201 Created`
- Body:
  ```json
  {
    "roadmap": {
      "id": "uuid",
      "title": "string",
      "experience_level": "string",
      "technology": "string",
      "goals": "string",
      "additional_info": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "items": [
        {
          "id": "uuid",
          "parent_item_id": "uuid | null",
          "title": "string",
          "description": "string",
          "level": number,
          "position": number,
          "is_completed": boolean,
          "completed_at": "timestamp | null"
        }
      ]
    }
  }
  ```
- Potencjalne kody błędów:
  - `400 Bad Request` – nieprawidłowe dane wejściowe lub przekroczono limit 5 roadmap.
  - `401 Unauthorized` – brak lub nieważny token.
  - `500 Internal Server Error` – błąd serwera lub usługi AI.

## 5. Przepływ danych
1. Po otrzymaniu żądania middleware uwierzytelniające (Supabase Auth) weryfikuje token i pobiera `user_id`.
2. Walidacja struktury i typów danych zgodnie z `CreateRoadmapCommand` (np. za pomocą biblioteki Zod).
3. Sprawdzenie limitu – zapytanie COUNT na `roadmaps` gdzie `user_id = auth.uid()`.
4. Wywołanie serwisu AI (`AIService.generateRoadmapItems`) do wygenerowania listy kroków.
5. W ramach transakcji:
   - INSERT do tabeli `roadmaps` (Supabase SDK).
   - Bulk INSERT do tabeli `roadmap_items` z wygenerowanymi elementami.
6. Mapowanie wyników na `RoadmapDetailsDto` i zwrócenie ich w odpowiedzi.

## 6. Względy bezpieczeństwa
- Autoryzacja: RLS na bazie Supabase dla `roadmaps` i `roadmap_items`.
- Walidacja inputu: ochrona przed atakami typu injection (użycie Supabase SDK i zaufanych bibliotek walidacji).

## 7. Obsługa błędów
| Sytuacja                                  | Kod HTTP | Treść odpowiedzi                              |
|-------------------------------------------|----------|-----------------------------------------------|
| Brak/nieprawidłowy token                  | 401      | `{ "error": "Unauthorized" }`             |
| Niekompletne/nieprawidłowe dane (Zod)     | 400      | `{ "error": "Bad Request", "details": [...] }` |
| Przekroczono limit 5 roadmap              | 400      | `{ "error": "User has reached max roadmaps" }` |
| Błąd usługi AI / timeout                  | 502      | `{ "error": "Bad Gateway", "message": "AI Service Error" }` |
| Błąd zapisu do bazy                       | 500      | `{ "error": "Internal Server Error" }`    |

## 8. Rozważania dotyczące wydajności
- Bulk insert dla `roadmap_items`.
- Gap-based ordering (pozycje co 1000) dla elastycznego wstawiania.
- Asynchroniczna praca z AI (timeout i retry).

## 9. Kroki implementacji
1. Utworzyć katalog `src/pages/api` i plik `roadmaps.ts`.
2. Skonfigurować handler Astro API z obsługą POST i JSON body.
3. Dodać middleware uwierzytelniające Supabase (pobrać `user_id`).
4. Zaimplementować walidację request body za pomocą Zod.
5. W `RoadmapService.createRoadmap`:
   - Sprawdzić limit roadmap na użytkownika.
   - Wywołać `AIService.generateRoadmapItems`.
   - Zapisać dane do `roadmaps` i `roadmap_items` w transakcji.
6. Utworzyć `AIService` z metodą do komunikacji z Openrouter.ai. Na tak wczesnym poziomie implementacji, skorzystamy z mocków zamiast rezultatów wygenerowanych przez AI.