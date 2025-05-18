# API Endpoint Implementation Plan: GET /api/roadmaps

## 1. Przegląd punktu końcowego
Ten punkt końcowy (`GET /api/roadmaps`) jest odpowiedzialny za pobieranie i zwracanie listy podsumowań roadmap należących do uwierzytelnionego użytkownika. Każde podsumowanie zawiera kluczowe informacje o roadmapie, takie jak ID, tytuł, poziom doświadczenia, technologię, cele oraz daty utworzenia i modyfikacji.

## 2. Szczegóły żądania
-   **Metoda HTTP:** `GET`
-   **Struktura URL:** `/api/roadmaps`
-   **Nagłówki:**
    -   `Authorization: Bearer <token>` (Wymagane) - Token JWT służący do uwierzytelnienia użytkownika.
-   **Parametry zapytania (Query Parameters):**
    -   Brak zdefiniowanych w specyfikacji. Należy rozważyć dodanie parametrów paginacji (`limit`, `offset`) w przyszłości, jeśli zajdzie taka potrzeba, zgodnie z istniejącym `PaginationMetaDto`.
-   **Ciało żądania (Request Body):** Brak (N/A dla metody GET).

## 3. Wykorzystywane typy
-   **`RoadmapSummaryDto`** (z `src/types.ts`): Definiuje strukturę każdego obiektu roadmapy w odpowiedzi.
    ```typescript
    export type RoadmapSummaryDto = Pick<
      Tables<"roadmaps">,
      "id" | "title" | "experience_level" | "technology" | "goals" | "created_at" | "updated_at"
    >;
    ```
-   **Struktura odpowiedzi API:**
    ```json
    {
      "roadmaps": [
        { 
          "id": "uuid", 
          "title": "string", 
          "experience_level": "string", 
          "technology": "string", 
          "goals": "string", 
          "created_at": "timestamp", 
          "updated_at": "timestamp" 
        }
      ]
    }
    ```

## 4. Szczegóły odpowiedzi
-   **Odpowiedź sukcesu (200 OK):**
    ```json
    {
      "roadmaps": [
        {
          "id": "c2f4c3f0-4b5a-4e4a-8f8a-3f3e3e3e3e3e",
          "title": "My First Roadmap",
          "experience_level": "Beginner",
          "technology": "React",
          "goals": "Learn React basics",
          "created_at": "2023-10-26T10:00:00Z",
          "updated_at": "2023-10-26T10:00:00Z"
        }
        // ... inne roadmapy
      ]
    }
    ```
-   **Odpowiedzi błędów:**
    -   `401 Unauthorized` (zgodnie ze standardowym formatem błędów API)
    -   `500 Internal Server Error` (zgodnie ze standardowym formatem błędów API)

## 5. Przepływ danych
1.  Żądanie `GET` trafia do endpointu `/api/roadmaps` w aplikacji Astro.
2.  Handler endpointu (plik w `src/pages/api/roadmaps.ts`):
    a.  Odbiera `user_id` z `Astro.locals`.
    b.  Wywołuje odpowiednią metodę w `DashboardService` (np. `getUserRoadmaps(userId)`).
3.  `DashboardService` (`src/lib/services/dashboard.service.ts`):
    a.  Używa klienta Supabase do wykonania zapytania do tabeli `roadmaps`.
    b.  Zapytanie filtruje roadmapy na podstawie `user_id` (RLS w Supabase również powinno to zapewnić).
    c.  Wybiera tylko pola wymagane dla `RoadmapSummaryDto`: `id`, `title`, `experience_level`, `technology`, `goals`, `created_at`, `updated_at`.
    d.  Zwraca listę obiektów `RoadmapSummaryDto` (lub pustą listę, jeśli użytkownik nie ma roadmap).
4.  Handler endpointu:
    a.  Otrzymuje listę `RoadmapSummaryDto` od serwisu.
    b.  Konstruuje obiekt odpowiedzi `{ "roadmaps": RoadmapSummaryDto[] }`.
    c.  Zwraca odpowiedź JSON z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa
-   **Autoryzacja:**
    -   Poziom API: Endpoint jest dostępny tylko dla uwierzytelnionych użytkowników.
    -   Poziom danych: Supabase Row Level Security (RLS) dla tabeli `roadmaps` musi być skonfigurowane tak, aby użytkownicy mogli pobierać wyłącznie własne roadmapy (`USING (auth.uid() = user_id)`). `db-plan.md` potwierdza taką konfigurację.
-   **Walidacja danych wejściowych:** Nie dotyczy bezpośrednio parametrów endpointu (poza tokenem), ale middleware musi skutecznie walidować token i dostarczać `user_id`.
-   **Ochrona przed nadmiernym ujawnieniem danych (Information Disclosure):** Należy zwracać tylko pola zdefiniowane w `RoadmapSummaryDto`, co minimalizuje ryzyko wycieku niepotrzebnych danych.

## 7. Obsługa błędów
-   **`401 Unauthorized`:**
    -   **Przyczyna:** Brak nagłówka `Authorization`, nieprawidłowy format tokenu, nieważny/wygasły token, nieudana weryfikacja użytkownika.
    -   **Obsługa:** Middleware zwraca odpowiedź `401` z odpowiednim komunikatem błędu w standardowym formacie.
-   **`500 Internal Server Error`:**
    -   **Przyczyna:** Błędy po stronie serwera, np. błąd połączenia z bazą danych Supabase, nieoczekiwany wyjątek w logice serwisowej, błąd konfiguracji RLS.
    -   **Obsługa:** Globalny handler błędów w Astro powinien przechwycić wyjątek, zalogować szczegóły błędu (w tym stack trace, `user_id` jeśli dostępne) i zwrócić generyczną odpowiedź `500` w standardowym formacie, aby nie ujawniać szczegółów implementacyjnych.
-   **Logowanie:** Wszystkie błędy serwera (5xx) oraz potencjalnie istotne błędy klienta (4xx, np. nieudane próby autoryzacji) powinny być logowane z wystarczającym kontekstem (timestamp, endpoint, `user_id` (jeśli jest), komunikat błędu, stack trace).

## 8. Rozważania dotyczące wydajności
-   **Zapytania do bazy danych:** Zapytanie do Supabase powinno być zoptymalizowane. Powinno wybierać tylko niezbędne kolumny (`id`, `title`, `experience_level`, `technology`, `goals`, `created_at`, `updated_at`) i korzystać z indeksu na `user_id` (zgodnie z `db-plan.md`: `idx_roadmaps_user_id`).
-   **Paginacja:** Chociaż nie jest to część obecnej specyfikacji, w przypadku dużej liczby roadmap na użytkownika, implementacja paginacji (np. `limit`/`offset`) będzie kluczowa dla wydajności i uniknięcia przesyłania dużych ilości danych. Należy to rozważyć jako przyszłe ulepszenie.
-   **Rozmiar odpowiedzi:** Zwracanie tylko niezbędnych pól (`RoadmapSummaryDto`) pomaga utrzymać mały rozmiar odpowiedzi.
-   **Caching:** Dla często odpytywanych, rzadko zmieniających się danych można by rozważyć mechanizmy cache'owania po stronie serwera lub klienta (np. nagłówki HTTP Cache-Control), ale dla list roadmap użytkownika, które mogą się często zmieniać, korzyści mogą być ograniczone bez skomplikowanej logiki unieważniania cache.

## 9. Etapy wdrożenia
1.  **Utworzenie `DashboardService` (`src/lib/services/dashboard.service.ts`):**
    *   Zdefiniować metodę, np. `async getUserRoadmaps(userId: string): Promise<RoadmapSummaryDto[] | null>`.
    *   Zaimplementować logikę pobierania danych z Supabase:
        *   Użyć klienta Supabase do wykonania zapytania `select("id, title, experience_level, technology, goals, created_at, updated_at")` z tabeli `roadmaps`.
        *   Filtrować wyniki po `user_id` (np. `.eq('user_id', userId)`).
        *   Dodać sortowanie, np. po `updated_at DESC`.
    *   Obsłużyć potencjalne błędy z Supabase (np. rzucając customowy błąd lub logując i zwracając `null`/pustą tablicę).
    *   Zapewnić, że zwracane dane są zgodne z typem `RoadmapSummaryDto[]`.
2.  **Utworzenie pliku endpointu Astro (`src/pages/api/roadmaps.ts`):**
    *   Zdefiniować funkcję obsługującą metodę `GET`.
    *   Pobrać `user_id` z `Astro.locals.user.id`. Jeśli nie ma (co nie powinno się zdarzyć, jeśli middleware działa poprawnie), zwrócić `401`.
    *   Wywołać `DashboardService.getUserRoadmaps(userId)`.
    *   W przypadku błędu z serwisu (np. jeśli rzuci wyjątek), zalogować błąd i zwrócić odpowiedź `500 Internal Server Error`.
    *   Jeśli dane zostaną pomyślnie pobrane (nawet jeśli jest to pusta lista), skonstruować odpowiedź JSON `{ "roadmaps": data }` i zwrócić ją z kodem statusu `200 OK`.
3.  **Definicje typów (`src/types.ts`):**
    *   Upewnić się, że `RoadmapSummaryDto` jest poprawnie zdefiniowany i używany. Potwierdzone jako zgodne.
4.  **Konfiguracja Supabase RLS:**
    *   Zweryfikować, czy zasady RLS dla tabeli `roadmaps` są aktywne i poprawnie skonfigurowane w Supabase, zgodnie z `db-plan.md`.
    ```sql
    ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

    CREATE POLICY user_roadmaps_access ON roadmaps
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    ```
5.  **Testowanie:**
    *   **Testy jednostkowe:** Dla `RoadmapService` (mockując klienta Supabase).
    *   **Testy integracyjne/API:**
        *   Żądanie z poprawnym tokenem JWT - oczekiwana odpowiedź `200 OK` z listą roadmap lub pustą listą.
        *   Żądanie bez tokenu JWT - oczekiwana odpowiedź `401 Unauthorized`.
        *   Żądanie z nieprawidłowym/wygasłym tokenem JWT - oczekiwana odpowiedź `401 Unauthorized`.
        *   Symulacja błędu bazy danych - oczekiwana odpowiedź `500 Internal Server Error`.
        *   Sprawdzenie, czy użytkownik A nie może pobrać roadmap użytkownika B.
6.  **Code Review:**
    *   Przeprowadzić przegląd kodu dla wszystkich zaimplementowanych komponentów.

Plan ten jest zgodny z dostarczonym stackiem technologicznym (Astro, TypeScript, Supabase) oraz zasadami implementacji (przy założeniu treści `@shared.mdc`, `@backend.mdc`, `@astro.mdc`). 