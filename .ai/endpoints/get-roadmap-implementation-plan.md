# Plan Implementacji Punktu Końcowego API: GET /api/roadmaps/:roadmapId

## 1. Przegląd Punktu Końcowego
Celem tego punktu końcowego jest umożliwienie użytkownikom pobierania szczegółowych informacji o pojedynczej roadmapie, włącznie z wszystkimi jej zagnieżdżonymi elementami (`roadmap_items`). Dostęp jest chroniony i wymaga uwierzytelnienia użytkownika.

## 2. Szczegóły Żądania
- **Metoda HTTP:** `GET`
- **Struktura URL:** `/api/roadmaps/:roadmapId`
- **Parametry Ścieżki:**
  - Wymagane:
    - `roadmapId` (UUID): Identyfikator roadmapy do pobrania.
- **Nagłówki:**
  - Wymagane:
    - `Authorization: Bearer <token>`: Token JWT uwierzytelniający użytkownika.
- **Ciało Żądania:** Brak (nie dotyczy dla metody GET).

## 3. Wykorzystywane Typy
Zgodnie z `src/types.ts`:
- `RoadmapDetailsDto`: Główny typ danych dla odpowiedzi, zawierający szczegóły roadmapy oraz listę jej elementów.
  ```typescript
  export interface RoadmapDetailsDto extends RoadmapDto {
    items: RoadmapItemDto[];
  }
  ```
- `RoadmapDto`: Reprezentuje dane samej roadmapy (bez `user_id`).
  ```typescript
  export type RoadmapDto = Omit<Tables<"roadmaps">, "user_id">;
  ```
- `RoadmapItemDto`: Reprezentuje pojedynczy element roadmapy.
  ```typescript
  export type RoadmapItemDto = Pick<
    Tables<"roadmap_items">,
    "id" | "parent_item_id" | "title" | "description" | "level" | "position" | "is_completed" | "completed_at"
  >;
  ```

## 4. Szczegóły Odpowiedzi
- **Odpowiedź Sukcesu (200 OK):**
  ```json
  {
    "roadmap": {
      "id": "uuid",
      "title": "string",
      "experience_level": "string",
      "technology": "string",
      "goals": "string",
      "additional_info": "string | null",
      "created_at": "string (timestamp)",
      "updated_at": "string (timestamp)",
      "items": [
        {
          "id": "uuid",
          "parent_item_id": "uuid | null",
          "title": "string",
          "description": "string | null",
          "level": "integer",
          "position": "integer",
          "is_completed": "boolean",
          "completed_at": "string (timestamp) | null"
        }
        // ... więcej elementów
      ]
    }
  }
  ```
- **Odpowiedzi Błędów:**
  - `400 Bad Request`: Nieprawidłowy format `roadmapId`.
  - `401 Unauthorized`: Brak lub nieprawidłowy token JWT.
  - `404 Not Found`: Roadmapa nie istnieje lub użytkownik nie ma do niej dostępu.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ Danych
1. Klient wysyła żądanie `GET` na `/api/roadmaps/:roadmapId` z nagłówkiem `Authorization`.
2. Middleware Astro (lub bezpośrednio handler) przechwytuje żądanie.
3. Następuje próba uwierzytelnienia użytkownika na podstawie tokena JWT przy użyciu Supabase Auth (np. `Astro.locals.supabase.auth.getUser()`).
4. Jeśli uwierzytelnienie się nie powiedzie, zwracany jest błąd `401 Unauthorized`.
5. Walidowany jest parametr `roadmapId` (czy jest to poprawny UUID). Jeśli nie, zwracany jest błąd `400 Bad Request`.
6. Wywoływana jest metoda z `RoadmapService`, np. `getRoadmapDetails(roadmapId, userId)`, przekazując `roadmapId` i `userId` (ID uwierzytelnionego użytkownika).
7. `RoadmapService` wykonuje zapytanie do bazy danych Supabase:
   - Pobiera dane roadmapy z tabeli `roadmaps` dla danego `roadmapId`. Zapytanie uwzględnia RLS, więc użytkownik musi być właścicielem (`user_id = auth.uid()`).
   - Pobiera wszystkie powiązane elementy z tabeli `roadmap_items` dla tej roadmapy (`roadmap_id = :roadmapId`). Zapytanie również uwzględnia RLS (sprawdza, czy użytkownik ma dostęp do nadrzędnej roadmapy).
   - Alternatywnie, jedno zapytanie z JOIN może pobrać wszystkie potrzebne dane.
8. Jeśli roadmapa nie zostanie znaleziona (lub RLS zablokuje dostęp), serwis zwraca `null` (lub rzuca specyficzny błąd).
9. Handler API na podstawie wyniku z serwisu:
   - Jeśli dane zostały pomyślnie pobrane, transformuje je do formatu `RoadmapDetailsDto` i zwraca odpowiedź `200 OK` z `{"roadmap": RoadmapDetailsDto}`.
   - Jeśli serwis zwróci `null` (lub zasygnalizował brak dostępu/istnienia), handler zwraca `404 Not Found`.
10. W przypadku innych błędów (np. błąd bazy danych), zwracany jest `500 Internal Server Error`.

## 6. Względy Bezpieczeństwa
- **Uwierzytelnianie:** Każde żądanie musi być uwierzytelnione za pomocą tokena JWT (Bearer Token) weryfikowanego przez Supabase. Dostęp anonimowy jest zabroniony.
- **Autoryzacja:** Dostęp do roadmapy jest ograniczony do jej właściciela. Realizowane jest to poprzez Row Level Security (RLS) w Supabase, wykorzystując `auth.uid()` w warunkach polityk dla tabel `roadmaps` i `roadmap_items` (zgodnie z `db-plan.md`).
- **Walidacja Danych Wejściowych:**
  - `roadmapId` musi być walidowany jako UUID, aby zapobiec błędom zapytań SQL i potencjalnym atakom.
- **Ochrona przed IDOR:** Dzięki RLS, nawet jeśli atakujący zgadnie poprawne UUID roadmapy, nie uzyska do niej dostępu, jeśli nie jest jej właścicielem. Odpowiedź `404 Not Found` jest zwracana w obu przypadkach (brak zasobu lub brak uprawnień), co nie ujawnia istnienia zasobu.
- **Minimalizacja Ujawnianych Danych:** Odpowiedź zawiera tylko pola zdefiniowane w `RoadmapDetailsDto`, pomijając wrażliwe dane jak `user_id` z tabeli `roadmaps`.

## 7. Obsługa Błędów
- **Struktura Odpowiedzi Błędu (JSON):**
  ```json
  {
    "error": {
      "message": "Szczegółowy opis błędu",
      "code": "OPCJONALNY_KOD_BLEDU_APLIKACJI" // np. INVALID_UUID, AUTH_TOKEN_MISSING
    }
  }
  ```
- **`400 Bad Request`:**
  - Przyczyna: Nieprawidłowy format `roadmapId`.
  - Komunikat: "Nieprawidłowy format ID roadmapy."
- **`401 Unauthorized`:**
  - Przyczyna: Brak nagłówka `Authorization` lub nieprawidłowy/wygasły token.
  - Komunikat: "Brak tokena autoryzacyjnego." lub "Nieprawidłowy lub wygasły token."
- **`404 Not Found`:**
  - Przyczyna: Roadmapa nie istnieje lub użytkownik nie ma do niej uprawnień.
  - Komunikat: "Roadmapa nie została znaleziona lub nie masz do niej uprawnień."
- **`500 Internal Server Error`:**
  - Przyczyna: Błędy po stronie serwera (np. błąd bazy danych, nieoczekiwany wyjątek w kodzie).
  - Komunikat: "Wystąpił nieoczekiwany błąd serwera."
  - Logowanie: Szczegółowe informacje o błędzie powinny być logowane po stronie serwera dla celów diagnostycznych.

## 8. Rozważania dotyczące Wydajności
- **Zapytania do Bazy Danych:**
  - Rozważyć, czy bardziej efektywne będzie jedno zapytanie SQL z `JOIN` między `roadmaps` a `roadmap_items`, czy dwa oddzielne zapytania (jedno dla roadmapy, drugie dla jej elementów). Dla dużej liczby elementów, osobne zapytania mogą być bardziej zarządzalne, ale mogą generować dodatkowy narzut.
  - Upewnić się, że na kolumnach używanych w klauzulach `WHERE` i `JOIN` (`id`, `roadmap_id`, `user_id`) istnieją odpowiednie indeksy (zgodnie z `db-plan.md`, `idx_roadmaps_user_id` i `idx_items_roadmap_parent_position` już istnieją i powinny być pomocne).
- **Rozmiar Odpowiedzi:** Jeśli roadmapy mogą zawierać bardzo dużą liczbę elementów, należy rozważyć paginację dla `items` w przyszłości, chociaż obecna specyfikacja API tego nie wymaga.
- **Caching:** Na razie nieplanowany, ale w przyszłości można rozważyć cachowanie na poziomie serwera (np. w Redis) dla często odpytywanych roadmap, jeśli wydajność stanie się problemem.

## 9. Etapy Wdrożenia
1.  **Utworzenie Pliku Trasy API:**
    -   Stworzyć plik dla dynamicznej trasy Astro, np. `src/pages/api/roadmaps/[roadmapId].ts`.
2.  **Implementacja Handlera Żądania GET:**
    -   W pliku trasy zaimplementować funkcję obsługującą metodę `GET`.
    -   Wykorzystać np. `Astro.params`, `Astro.request`, `Astro.locals` do uzyskania `roadmapId` i informacji o użytkowniku.
3.  **Uwierzytelnianie Użytkownika:**
    -   Zintegrować z Supabase Auth w celu weryfikacji tokena JWT z nagłówka `Authorization`.
    -   Pobrać ID uwierzytelnionego użytkownika (`userId`). Jeśli użytkownik nie jest uwierzytelniony, zwrócić `401 Unauthorized`.
4.  **Walidacja `roadmapId`:**
    -   Sprawdzić, czy `roadmapId` z `Astro.params` jest poprawnym UUID. Jeśli nie, zwrócić `400 Bad Request`.
5.  **Stworzenie/Aktualizacja `RoadmapService`:**
    -   Utworzyć (jeśli nie istnieje) lub zaktualizować serwis (np. `src/lib/services/roadmap.service.ts`).
    -   Dodać metodę `getRoadmapDetails(roadmapId: string, userId: string): Promise<RoadmapDetailsDto | null>`.
    -   Wewnątrz metody zaimplementować logikę pobierania danych z Supabase:
        -   Pobranie roadmapy: `supabase.from('roadmaps').select('*').eq('id', roadmapId).eq('user_id', userId).single()` (RLS także tu zadziała, ale jawne dodanie `user_id` jest dobrą praktyką dla `single()`).
        -   Pobranie elementów: `supabase.from('roadmap_items').select('*').eq('roadmap_id', roadmapId).order('position')`. RLS na `roadmap_items` zapewni, że użytkownik ma dostęp przez nadrzędną roadmapę.
        -   Obsłużyć przypadki, gdy roadmapa lub elementy nie zostaną znalezione.
        -   Połączyć dane w obiekt `RoadmapDetailsDto`.
6.  **Wywołanie Serwisu w Handlerze:**
    -   Wywołać metodę `roadmapService.getRoadmapDetails(roadmapId, userId)`.
7.  **Obsługa Odpowiedzi z Serwisu:**
    -   Jeśli serwis zwróci `RoadmapDetailsDto`, przygotować odpowiedź `200 OK` z `{"roadmap": dto}`.
    -   Jeśli serwis zwróci `null` (lub zasygnalizuje błąd "not found"), zwrócić `404 Not Found`.
8.  **Implementacja Obsługi Błędów:**
    -   Zaimplementować globalny mechanizm obsługi błędów lub używać try-catch w handlerze do przechwytywania wyjątków z serwisu i zwracania odpowiednich kodów statusu HTTP (400, 401, 404, 500) wraz z komunikatami w formacie JSON.