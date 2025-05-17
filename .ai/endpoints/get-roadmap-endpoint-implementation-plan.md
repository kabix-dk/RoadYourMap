# API Endpoint Implementation Plan: GET /api/roadmaps/:roadmapId

## 1. Przegląd punktu końcowego
Pobranie pojedynczej roadmapy wraz z hierarchiczną listą elementów (nested items) dla uwierzytelnionego użytkownika.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/roadmaps/:roadmapId`
- Nagłówki:
  - `Authorization: Bearer <token>` (JWT Supabase)
- Parametry ścieżki:
  - `roadmapId` (string, UUID) — wymagany
- Parametry zapytania: brak
- Body: brak

## 3. Wykorzystywane typy
- `RoadmapDto` — typ DTO dla tabeli `roadmaps` (bez `user_id`).
- `RoadmapItemDto` — typ DTO dla elementu tabeli `roadmap_items`.
- `RoadmapDetailsDto` — `RoadmapDto` + `items: RoadmapItemDto[]`.

## 4. Szczegóły odpowiedzi
- 200 OK
  ```json
  {
    "roadmap": {
      /* zgodnie z RoadmapDetailsDto */
    }
  }
  ```
- Kody błędów:
  - 400 Bad Request — nieprawidłowy format `roadmapId`.
  - 401 Unauthorized — brak lub niepoprawny token.
  - 404 Not Found — nieistniejąca lub nieautoryzowana roadmapa.
  - 500 Internal Server Error — nieoczekiwany błąd serwera.

## 5. Przepływ danych
1. Walidacja `params.roadmapId` (np. za pomocą Zod).
2. Wywołanie serwisu: `RoadmapService.getRoadmapDetails(userId, roadmapId)`.
   - Pobranie rekordu z `roadmaps` filtrując `id` i `user_id`.
   - Pobranie elementów z `roadmap_items` filtrowanie po `roadmap_id` i sortowanie po `position`.
   - Opcjonalne zbudowanie struktury drzewiastej (nested).
3. Zwrócenie odpowiedzi 200 z obiektem DTO.

## 6. Względy bezpieczeństwa
- Autoryzacja: RLS w bazie danych (Supabase) oraz weryfikacja `user_id`.
- Walidacja wejścia: Zod dla `roadmapId`.
- Ochrona przed SQL Injection: korzystanie z parametryzowanych zapytań supabase-js.

## 7. Obsługa błędów
- 400: błędny UUID → `{ error: "Invalid roadmapId parameter" }`.
- 401: brak/nieprawidłowy token → `{ error: "Unauthorized" }`.
- 404: brak rekordów → `{ error: "Roadmap not found" }`.
- 500: pozostałe wyjątki → `{ error: "Internal Server Error" }`.
- Logowanie błędów:
  - `console.error` z pełnym kontekstem.
  - (Opcjonalnie) tabela `api_error_logs` z polami: `id`, `endpoint`, `user_id`, `message`, `stack`, `timestamp`.

## 8. Wydajność
- Wykorzystanie indeksów: `idx_roadmaps_user_id`, `idx_items_roadmap_parent_position`.
- Możliwe jedno zapytanie z nested select supabase-js:
  ```ts
  supabaseClient
    .from("roadmaps")
    .select("*, roadmap_items(order:position){*}")
    .eq("id", roadmapId)
    .single();
  ```
- Paginacja elementów, jeśli ich liczba rośnie.

## 9. Kroki implementacji
1. Utworzyć plik `src/pages/api/roadmaps/[roadmapId].ts`.
2. Zaimportować:
   - `APIRoute` z `"astro"`.
   - `z` z `"zod"`.
   - DTO: `RoadmapDetailsDto` z `src/types.ts`.
3. Zdefiniować schemat Zod dla `params.roadmapId`.
4. Implementować `export const GET: APIRoute = async ({ params, locals, request }) => { ... }`:
   - Parsowanie i walidacja parametru.
   - Wywołanie serwisu.
   - Menu obsługi błędów z odpowiednimi kodami statusu.
5. Stworzyć serwis w `src/lib/services/roadmap-service.ts`:
   ```ts
   export class RoadmapService {
     constructor(private supabase: SupabaseClient) {}
     async getRoadmapDetails(userId: string, roadmapId: string): Promise<RoadmapDetailsDto> { ... }
   }
   ```
6. Uruchomić lint i naprawić ewentualne błędy.