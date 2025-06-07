# API Endpoint Implementation Plan: POST /api/roadmaps/:roadmapId/items

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia dodanie nowego elementu (`roadmap_item`) do określonej roadmapy (`roadmap`). Jest to operacja chroniona, wymagająca uwierzytelnienia użytkownika. Nowy element może być dodany na najwyższym poziomie lub jako element zagnieżdżony w innym istniejącym elemencie.

## 2. Szczegóły żądania
-   **Metoda HTTP:** `POST`
-   **Struktura URL:** `/api/roadmaps/{roadmapId}/items`
-   **Nagłówki:**
    -   `Authorization: Bearer <token>` (JWT token)
    -   `Content-Type: application/json`
-   **Parametry ścieżki:**
    -   `roadmapId` (string, uuid): Identyfikator roadmapy, do której dodawany jest element.
-   **Ciało żądania (Request Body):**
    ```json
    {
      "parent_item_id": "string|null",
      "title": "string",
      "description": "string",
      "level": "number",
      "position": "number"
    }
    ```
    -   **Wymagane pola:** `title`, `level`, `position`
    -   **Opcjonalne pola:** `parent_item_id`, `description`

## 3. Wykorzystywane typy
-   **Command Model (wejście):** `CreateRoadmapItemCommand` z `src/types.ts`
-   **DTO (wyjście):** `RoadmapItemRecordDto` z `src/types.ts`

## 4. Szczegóły odpowiedzi
-   **Odpowiedź sukcesu (201 Created):**
    -   Zwraca pełny obiekt nowo utworzonego elementu (`RoadmapItemRecordDto`) w formacie JSON.
    ```json
    {
        "id": "uuid",
        "roadmap_id": "uuid",
        "parent_item_id": "uuid|null",
        "title": "string",
        "description": "string|null",
        "level": "number",
        "position": "number",
        "is_completed": false,
        "completed_at": null,
        "created_at": "timestamptz",
        "updated_at": "timestamptz"
    }
    ```
-   **Odpowiedzi błędów:**
    -   `400 Bad Request`: Błędy walidacji danych wejściowych lub naruszenie ograniczenia unikalności pozycji.
    -   `401 Unauthorized`: Brak, nieprawidłowy lub wygasły token JWT.
    -   `404 Not Found`: Mapa drogowa (`roadmap`) lub element nadrzędny (`parent_item`) nie zostały znalezione.
    -   `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1.  Żądanie `POST` trafia do endpointu w `src/pages/api/roadmaps/[roadmapId]/items.ts`.
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje token JWT. Jeśli jest nieprawidłowy, zwraca `401`.
3.  Endpoint parsuje i waliduje `roadmapId` z URL oraz ciało żądania przy użyciu schemy Zod. W przypadku błędu zwraca `400`.
4.  Endpoint wywołuje funkcję serwisową, np. `createRoadmapItem(supabase, roadmapId, createCommand)`, przekazując klienta Supabase z `context.locals` oraz zwalidowane dane.
5.  Funkcja serwisowa weryfikuje istnienie `roadmap` o podanym `roadmapId` (uwzględniając RLS). Jeśli nie istnieje, zwraca błąd, który endpoint tłumaczy na `404`.
6.  Jeśli `parent_item_id` jest podane, serwis weryfikuje jego istnienie w obrębie tej samej mapy drogowej. Jeśli nie istnieje, zwraca błąd `404`.
7.  Serwis wykonuje operację `INSERT` na tabeli `roadmap_items` w bazie danych Supabase.
8.  Baza danych, dzięki constraintowi `UNIQUE (roadmap_id, parent_item_id, position)`, zapobiega duplikatom pozycji. W przypadku naruszenia, klient Supabase zwróci błąd.
9.  Serwis przechwytuje potencjalne błędy z bazy danych (np. naruszenie unikalności) i zwraca odpowiedni wynik do endpointu.
10. Endpoint, na podstawie wyniku z serwisu, zwraca odpowiedź: `201 Created` z danymi nowego elementu lub odpowiedni kod błędu (`400`, `404`, `500`).

## 6. Względy bezpieczeństwa
-   **Uwierzytelnianie:** Middleware Astro musi poprawnie weryfikować token JWT Supabase.
-   **Autoryzacja:** Dostęp do danych jest ograniczony przez polityki Row Level Security (RLS) w PostgreSQL. Zapytania do bazy danych muszą być wykonywane przy użyciu klienta Supabase z kontekstu zalogowanego użytkownika (`context.locals.supabase`), aby RLS był stosowany.
-   **Walidacja danych wejściowych:** Użycie Zod do walidacji schematu `CreateRoadmapItemCommand` jest kluczowe, aby zapobiec nieprawidłowym danym i potencjalnym atakom (np. NoSQL injection, chociaż używamy SQL). Wszystkie dane wejściowe muszą być traktowane jako niezaufane.
-   **Zapobieganie SQL Injection:** Użycie klienta Supabase (który korzysta z parametryzowanych zapytań) jest standardową i skuteczną ochroną.

## 7. Rozważania dotyczące wydajności
-   Operacja jest pojedynczym zapisem (`INSERT`), więc nie powinna stanowić problemu wydajnościowego przy standardowym obciążeniu.
-   Należy upewnić się, że istnieją odpowiednie indeksy na kluczach obcych (`roadmap_id`, `parent_item_id`) oraz na kolumnach używanych w warunkach `WHERE` (co jest już zaplanowane w `db-plan.md`). Indeks `idx_items_roadmap_parent_position` będzie kluczowy dla weryfikacji unikalności pozycji.

## 8. Etapy wdrożenia
1.  **Definicja schemy Zod:** Stworzenie schemy walidacji dla `CreateRoadmapItemCommand` w pliku endpointu.
2.  **Utworzenie pliku endpointu:** Stworzenie pliku `src/pages/api/roadmaps/[roadmapId]/items.ts` z handlerem `POST`.
3.  **Implementacja handlera `POST`:**
    -   Pobranie `roadmapId` z `Astro.params`.
    -   Pobranie klienta Supabase z `Astro.locals.supabase`.
    -   Walidacja ciała żądania za pomocą zdefiniowanej schemy Zod.
    -   Obsługa błędów walidacji i zwracanie odpowiedzi `400`.
4.  **Rozbudowa serwisu `roadmap.service.ts`:**
    -   Stworzenie nowej funkcji `createRoadmapItem`, która przyjmuje klienta Supabase, `roadmapId` oraz `CreateRoadmapItemCommand`.
    -   Implementacja logiki weryfikacji istnienia `roadmap` i `parent_item_id`.
    -   Wykonanie operacji `INSERT` na tabeli `roadmap_items`.
    -   Dodanie obsługi błędów z bazy danych (w szczególności błędu naruszenia unikalności) i zwrócenie ustrukturyzowanej odpowiedzi (np. `{ data: newItem, error: null }` lub `{ data: null, error: ... }`).
5.  **Integracja endpointu z serwisem:**
    -   Wywołanie `roadmapService.createRoadmapItem` z handlera `POST`.
    -   Mapowanie odpowiedzi z serwisu na odpowiednie odpowiedzi HTTP (`201`, `400`, `404`, `500`). 