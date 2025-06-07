# API Endpoint Implementation Plan: DELETE /api/roadmaps/:roadmapId/items/:itemId

## 1. Przegląd punktu końcowego
Ten punkt końcowy jest odpowiedzialny za usunięcie pojedynczego elementu roadmapy (`roadmap_item`) identyfikowanego przez `itemId`, który należy do określonej roadmapy (`roadmapId`). Dzięki mechanizmowi `ON DELETE CASCADE` w bazie danych, usunięcie elementu nadrzędnego automatycznie powoduje usunięcie wszystkich jego elementów podrzędnych. Operacja jest chroniona i dostępna tylko dla uwierzytelnionego użytkownika, który jest właścicielem danej roadmapy.

## 2. Szczegóły żądania
- **Metoda HTTP:** `DELETE`
- **Struktura URL:** `/api/roadmaps/:roadmapId/items/:itemId`
- **Parametry:**
  - **Wymagane (w ścieżce):**
    - `roadmapId` (string, format UUID): Identyfikator roadmapy.
    - `itemId` (string, format UUID): Identyfikator elementu do usunięcia.
- **Nagłówki:**
  - `Authorization: Bearer <token>` (string): Token JWT uzyskany z Supabase Auth.
- **Ciało żądania:** Brak.

## 3. Wykorzystywane typy
Implementacja tego endpointu nie wymaga użycia specyficznych typów DTO ani Command Models z `src/types.ts`, ponieważ całe żądanie opiera się na parametrach ścieżki URL i nie zawiera ciała.

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu:**
  - **Kod stanu:** `204 No Content`
  - **Treść:** Brak.
- **Odpowiedzi błędów:**
  - **Kod stanu:** `400 Bad Request` - Nieprawidłowy format `roadmapId` lub `itemId`.
  - **Kod stanu:** `401 Unauthorized` - Brak lub nieprawidłowy token uwierzytelniający.
  - **Kod stanu:** `404 Not Found` - Roadmapa lub element nie istnieją, lub użytkownik nie ma do nich uprawnień.
  - **Kod stanu:** `500 Internal Server Error` - Wewnętrzny błąd serwera.

## 5. Przepływ danych
1. Żądanie `DELETE` trafia do serwera Astro na adres `/api/roadmaps/[roadmapId]/items/[itemId].ts`.
2. Middleware Astro weryfikuje token `Authorization` i dołącza sesję użytkownika oraz klienta Supabase do `context.locals`. Jeśli token jest nieprawidłowy, zwraca `401 Unauthorized`.
3. Handler `DELETE` w pliku endpointu jest wywoływany.
4. Parametry `roadmapId` i `itemId` są odczytywane z `context.params`.
5. Parametry są walidowane przy użyciu schemy Zod. W przypadku błędu zwracany jest status `400`.
6. Wywoływana jest funkcja serwisowa `roadmapItemService.deleteItem({ roadmapId, itemId })`, przekazując klienta Supabase z `context.locals.supabase`.
7. Funkcja serwisowa wykonuje zapytanie `supabase.from('roadmap_items').delete().match({ id: itemId, roadmap_id: roadmapId })`.
8. Polityka RLS w bazie danych PostgreSQL automatycznie sprawdza, czy `auth.uid()` jest zgodne z `user_id` powiązanej roadmapy, zapewniając autoryzację.
9. Mechanizm `ON DELETE CASCADE` w bazie danych usuwa rekursywnie wszystkie elementy podrzędne.
10. Jeśli zapytanie usunęło `0` wierszy (ponieważ element nie istniał lub RLS zablokował operację), serwis zwraca informację o niepowodzeniu.
11. Handler API na podstawie odpowiedzi z serwisu zwraca `204 No Content` w przypadku sukcesu lub `404 Not Found` w przypadku niepowodzenia.
12. Wszelkie nieoczekiwane błędy są przechwytywane, logowane, a do klienta wysyłany jest status `500`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Middleware Astro będzie odpowiedzialne za weryfikację tokenu JWT. Każde żądanie bez ważnego tokenu zostanie odrzucone z kodem `401`.
- **Autoryzacja:** Za autoryzację odpowiada polityka RLS (`user_items_access`) zdefiniowana w bazie danych Supabase. Gwarantuje ona, że użytkownik może usunąć tylko te elementy, które należą do jego własnych roadmap. To skutecznie zapobiega atakom typu IDOR.
- **Walidacja danych wejściowych:** Użycie `zod` do walidacji formatu UUID parametrów `roadmapId` i `itemId` chroni przed błędami i potencjalnymi atakami opartymi na złośliwych danych wejściowych.
- **Obsługa błędów:** Zgodnie z najlepszymi praktykami, zwracanie jednolitego błędu `404 Not Found` zarówno dla nieistniejących zasobów, jak i braku uprawnień, zapobiega wyciekowi informacji o strukturze danych.

## 7. Rozważania dotyczące wydajności
- Operacja usunięcia jest zazwyczaj szybka. Potencjalnym wąskim gardłem może być kaskadowe usuwanie dużej liczby (tysięcy) zagnieżdżonych elementów.
- Indeks `idx_items_roadmap_parent_position` na `(roadmap_id)` pomoże w szybkim zlokalizowaniu elementu do usunięcia.
- Ponieważ operacja jest wywoływana przez użytkownika i dotyczy specyficznego elementu, nie przewiduje się problemów z wydajnością przy typowym użytkowaniu.

## 8. Etapy wdrożenia
1. **Utworzenie pliku endpointu:** Stwórz plik `src/pages/api/roadmaps/[roadmapId]/items/[itemId].ts`.
2. **Definicja schemy walidacji:** W pliku endpointu zdefiniuj schemę Zod do walidacji `roadmapId` i `itemId` jako stringów UUID.
    ```typescript
    import { z } from 'zod';

    const paramsSchema = z.object({
      roadmapId: z.string().uuid(),
      itemId: z.string().uuid(),
    });
    ```
3. **Utworzenie funkcji serwisowej:**
   - Skorzystaj z istniejącego już serwisu `roadmap.service.ts`.
   - Zdefiniuj w nim asynchroniczną funkcję `deleteRoadmapItem`, która przyjmuje `SupabaseClient`, `roadmapId` i `itemId`.
   - Wewnątrz funkcji wykonaj operację `delete` na tabeli `roadmap_items` używając `match` do jednoczesnego sprawdzenia `id` i `roadmap_id`.
   - Sprawdź pole `count` w wyniku. Jeśli `count` wynosi `0`, zwróć `false` (lub rzuć niestandardowy błąd `NotFoundError`). W przeciwnym razie zwróć `true`.
4. **Implementacja handlera `DELETE`:**
   - W pliku `src/pages/api/roadmaps/[roadmapId]/items/[itemId].ts` wyeksportuj asynchroniczną funkcję `DELETE({ params, locals })`.
   - Użyj bloku `try...catch` do obsługi błędów.
   - Pobierz klienta Supabase z `locals.supabase` i parametry z `params`.
   - Przeprowadź walidację parametrów przy użyciu zdefiniowanej schemy Zod.
   - Wywołaj funkcję `roadmapItemService.deleteItem(...)`.
   - Jeśli serwis zwróci `true`, odpowiedz statusem `204`.
   - Jeśli serwis zwróci `false`, odpowiedz statusem `404`.
   - W bloku `catch` obsłuż błędy walidacji (zwróć `400`) oraz inne nieoczekiwane błędy (zaloguj i zwróć `500`).
5. **Konfiguracja eksportu:** Upewnij się, że `export const prerender = false;` jest ustawione w pliku endpointu, aby zapewnić dynamiczne renderowanie.