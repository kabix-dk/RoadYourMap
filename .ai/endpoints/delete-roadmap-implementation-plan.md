# API Endpoint Implementation Plan: DELETE /api/roadmaps/:roadmapId

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom usuwanie swoich map drogowych (`roadmaps`). Usunięcie mapy drogowej pociąga za sobą również kaskadowe usunięcie wszystkich powiązanych z nią elementów (`roadmap_items`) dzięki regułom zdefiniowanym w bazie danych.

## 2. Szczegóły żądania
- **Metoda HTTP:** `DELETE`
- **Struktura URL:** `/api/roadmaps/:roadmapId`
- **Nagłówki:**
  - `Authorization: Bearer <supabase_jwt_token>` (Wymagane)
- **Parametry ścieżki (Path Params):**
  - `roadmapId` (UUID, Wymagane): Identyfikator mapy drogowej do usunięcia.
- **Ciało żądania (Request Body):** Brak

## 3. Wykorzystywane typy
- `roadmapId: string` (Format UUID) - Identyfikator mapy drogowej z parametrów ścieżki.
- `userId: string` (Format UUID) - Identyfikator użytkownika wyekstrahowany z tokenu JWT.
- Supabase client types (np. `PostgrestResponse`, `PostgrestError`) do interakcji z bazą danych.
- Typy z `src/db/database.types.ts` (np. `Tables<"roadmaps">`) mogą być używane wewnętrznie w warstwie serwisowej, chociaż nie są bezpośrednio częścią kontraktu API dla tego endpointu.

## 4. Szczegóły odpowiedzi
- **Sukces:**
  - `204 No Content`: Pomyślnie usunięto mapę drogową. Brak ciała odpowiedzi.
- **Błędy:**
  - `400 Bad Request`: Nieprawidłowy format `roadmapId` (np. nie jest UUID).
    ```json
    {
      "error": "Invalid roadmapId format. Must be a UUID."
    }
    ```
  - `401 Unauthorized`: Brak tokenu JWT lub token jest nieprawidłowy.
    ```json
    // Odpowiedź generowana przez middleware Astro lub Supabase Auth
    {
      "message": "Unauthorized" 
    }
    ```
  - `404 Not Found`: Mapa drogowa o podanym `roadmapId` nie istnieje lub użytkownik nie ma uprawnień do jej usunięcia.
    ```json
    {
      "error": "Roadmap not found or user not authorized."
    }
    ```
  - `500 Internal Server Error`: Wystąpił nieoczekiwany błąd po stronie serwera.
    ```json
    {
      "error": "An unexpected error occurred."
    }
    ```

## 5. Przepływ danych
1.  Klient wysyła żądanie `DELETE` na `/api/roadmaps/:roadmapId` z tokenem JWT w nagłówku `Authorization`.
2.  Middleware Astro przechwytuje żądanie:
    a. Weryfikuje token JWT. Jeśli jest nieprawidłowy/brak, zwraca `401 Unauthorized`.
    b. Jeśli token jest prawidłowy, wyodrębnia dane użytkownika (w tym `userId`) i przekazuje je do kontekstu żądania.
3.  Handler API Astro (np. w `src/pages/api/roadmaps/[roadmapId].ts` dla metody `DELETE`):
    a. Odczytuje `roadmapId` z parametrów ścieżki.
    b. Waliduje format `roadmapId`. Jeśli nieprawidłowy, zwraca `400 Bad Request`.
    c. Wywołuje metodę `deleteRoadmap(roadmapId, userId)` w `RoadmapService`.
4.  `RoadmapService` (`src/lib/services/RoadmapService.ts`):
    a. Używa klienta Supabase do wykonania operacji `DELETE` na tabeli `roadmaps` z warunkiem `id = roadmapId`. RLS w Supabase automatycznie zapewni, że operacja powiedzie się tylko jeśli `user_id` (z sesji `auth.uid()`) pasuje do `user_id` mapy drogowej.
    b. Baza danych PostgreSQL (Supabase) usuwa mapę drogową.
    c. Dzięki regule `ON DELETE CASCADE` zdefiniowanej dla `roadmap_items.roadmap_id`, wszystkie powiązane elementy mapy drogowej (`roadmap_items`) są automatycznie usuwane.
    d. Analizuje odpowiedź z Supabase:
        i. Jeśli operacja usunęła rekord (np. `count === 1`), zwraca sukces.
        ii. Jeśli operacja nie usunęła żadnego rekordu (`count === 0`), oznacza to, że mapa nie została znaleziona lub użytkownik nie miał uprawnień (RLS uniemożliwił operację). Serwis zwraca odpowiedni status wskazujący na "nie znaleziono".
5.  Handler API Astro:
    a. Na podstawie wyniku z `RoadmapService`, wysyła odpowiedź HTTP: `204 No Content` w przypadku sukcesu, lub odpowiedni kod błędu (`404`, `500`) wraz z komunikatem.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Zapewnione przez Supabase Auth i middleware Astro weryfikujący tokeny JWT. Każde żądanie musi zawierać prawidłowy token.
- **Autoryzacja:**
    - Realizowana przez Row Level Security (RLS) w Supabase. Polityka `user_roadmaps_access` na tabeli `roadmaps` (`USING (auth.uid() = user_id)`) gwarantuje, że użytkownicy mogą usuwać tylko własne mapy drogowe.
    - Eliminuje to ryzyko IDOR (Insecure Direct Object Reference).
- **Walidacja danych wejściowych:**
    - `roadmapId` musi być walidowany jako UUID, aby zapobiec błędom i potencjalnym atakom.

## 7. Obsługa błędów
- **Błędy walidacji (`400 Bad Request`):** Handler API zwraca błąd, jeśli `roadmapId` nie jest UUID.
- **Błędy uwierzytelniania (`401 Unauthorized`):** Middleware obsługuje nieprawidłowe/brakujące tokeny.
- **Błędy autoryzacji/Nie znaleziono (`404 Not Found`):** Jeśli `RoadmapService` nie może znaleźć mapy drogowej lub RLS uniemożliwia usunięcie (co z perspektywy użytkownika wygląda jak brak zasobu), zwracany jest `404`.
- **Błędy serwera (`500 Internal Server Error`):**
    - Niespodziewane błędy w `RoadmapService` lub podczas komunikacji z Supabase.
    - Błędy te powinny być logowane po stronie serwera w celu diagnozy.
- Zgodnie z `shared.mdc`, funkcje powinny używać wczesnych powrotów (early returns) dla warunków błędów i umieszczać ścieżkę sukcesu na końcu.

## 8. Rozważania dotyczące wydajności
- Operacja `DELETE` w PostgreSQL na indeksowanym kluczu głównym (`id`) jest generalnie szybka.
- Kaskadowe usuwanie (`ON DELETE CASCADE`) dla `roadmap_items` może wpłynąć na wydajność, jeśli mapa drogowa ma bardzo dużą liczbę elementów. Jednak dla typowych zastosowań nie powinno to stanowić problemu.

## 9. Etapy wdrożenia
1.  **Konfiguracja trasy API w Astro:**
    - Utwórz (lub zaktualizuj) plik `src/pages/api/roadmaps/[roadmapId].ts`.
    - Zaimplementuj funkcję `DEL` (lub `DELETE` zgodnie z konwencją Astro dla metod HTTP) jako `async` handler.
2.  **Implementacja Middleware (jeśli jeszcze nie ma globalnego):**
    - Upewnij się, że middleware Astro (`src/middleware/index.ts`) poprawnie obsługuje weryfikację tokenów JWT Supabase i udostępnia `userId` (np. przez `Astro.locals`).
3.  **Handler API (`[roadmapId].ts`):**
    a.  Pobierz `roadmapId` z `Astro.params.roadmapId`.
    b.  Zwaliduj `roadmapId` (np. używając biblioteki do walidacji UUID lub wyrażenia regularnego). Jeśli nieprawidłowy, zwróć `Astro.Response` z kodem `400` i odpowiednim JSON-em.
    c.  Pobierz `userId` z `Astro.locals.user.id` (lub odpowiedniej ścieżki ustawionej przez middleware). Jeśli brak `userId` (np. middleware nie przepuściło, choć powinno zwrócić `401` wcześniej), obsłuż jako błąd.
    d.  Zainicjuj `RoadmapService`.
    e.  Wywołaj `await roadmapService.deleteRoadmap(roadmapId, userId)`.
    f.  Obsłuż wynik z serwisu:
        - Jeśli sukces: `return new Response(null, { status: 204 });`
        - Jeśli błąd (np. not found): `return new Response(JSON.stringify({ error: "Roadmap not found or user not authorized." }), { status: 404, headers: { 'Content-Type': 'application/json' } });`
        - W przypadku nieoczekiwanych błędów z serwisu, zaloguj błąd i zwróć `500`.
4.  **Implementacja `RoadmapService` (`src/lib/services/RoadmapService.ts`):**
    a.  Dodaj metodę `async deleteRoadmap(roadmapId: string, userId: string): Promise<{ success: boolean, status?: number, error?: string }>`
        *   **Uwaga:** `userId` jest przekazywany dla spójności i potencjalnych przyszłych logów lub weryfikacji na poziomie aplikacji, chociaż główna autoryzacja opiera się na RLS i `auth.uid()` w kontekście Supabase.
    b.  Wewnątrz metody, użyj klienta Supabase z `src/db/supabase.client.ts`:
        ```typescript
        const { error, count } = await supabaseClient
          .from('roadmaps')
          .delete()
          .eq('id', roadmapId); // RLS zadba o resztę autoryzacji na podstawie user_id z sesji
        ```
    c.  Przetwórz wynik:
        - Jeśli `error`: Zaloguj `error` i zwróć `{ success: false, status: 500, error: 'Database error' }` (lub bardziej szczegółowy błąd, jeśli to możliwe, np. mapując błędy PostgREST).
        - Jeśli `count === 0`: Mapa nie została znaleziona lub RLS uniemożliwił usunięcie. Zwróć `{ success: false, status: 404, error: 'Not found or not authorized' }`.
        - Jeśli `count > 0` (powinno być `1`): Zwróć `{ success: true }`.
5.  **Weryfikacja RLS i kaskadowego usuwania:**
    - Upewnij się, że polityki RLS dla `roadmaps` są aktywne i poprawnie skonfigurowane w Supabase (zgodnie z `db-plan.md`).
    - Upewnij się, że relacja `roadmap_items.roadmap_id` ma ustawione `ON DELETE CASCADE`.