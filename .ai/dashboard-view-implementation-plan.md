# Plan implementacji widoku Dashboard (Lista Roadmap)

## 1. Przegląd
Widok "Dashboard (Lista Roadmap)" służy do przeglądania i zarządzania istniejącymi roadmapami użytkownika. Umożliwia szybki wgląd w kluczowe informacje o roadmapach, takie jak tytuł, data utworzenia oraz postęp (wymaga implementacji kalkulacji postępu). Użytkownik może również inicjować akcje podglądu, edycji i usuwania roadmap. Widok jest chroniony i dostępny tylko dla zalogowanych użytkowników.

## 2. Routing widoku
- **Ścieżka:** `/dashboard`
- **Ochrona:** Widok powinien być chroniony. Niezalogowani użytkownicy próbujący uzyskać dostęp do `/dashboard` powinni być przekierowani na stronę logowania. Implementacja ochrony trasy powinna zostać zrealizowana za pomocą middleware Astro (`src/middleware/index.ts`).

## 3. Struktura komponentów
Widok będzie składał się z następujących głównych komponentów, zorganizowanych hierarchicznie:

```
DashboardPage (Astro Page: src/pages/dashboard.astro)
└── RoadmapListContainer (React Component: src/components/dashboard/RoadmapListContainer.tsx)
    ├── RoadmapCard (React Component: src/components/dashboard/RoadmapCard.tsx) [* N razy, dla każdej roadmapy]
    │   ├── ProgressBar (React Component: src/components/ui/progress.tsx)
    │   └── Button (React Component: src/components/ui/button.tsx) [Podgląd, Edycja, Usuń]
    └── DeleteConfirmationDialog (React Component: src/components/dashboard/DeleteConfirmationDialog.tsx)
        └── Button (React Component: src/components/ui/button.tsx) [Potwierdź, Anuluj]
```
Komponenty UI (`ProgressBar`, `Button`, `Card` - użyty jako baza dla `RoadmapCard`, `Dialog` - użyty jako baza dla `DeleteConfirmationDialog`) będą pochodzić z biblioteki Shadcn/ui (`src/components/ui`).

## 4. Szczegóły komponentów

### `DashboardPage` (Astro Page)
- **Lokalizacja:** `src/pages/dashboard.astro`
- **Opis komponentu:** Główny plik strony Astro dla ścieżki `/dashboard`. Odpowiada za ogólną strukturę strony, ochronę trasy (pośrednio przez middleware) i renderowanie kontenera listy roadmap (`RoadmapListContainer`). Może przekazywać początkowe dane lub dane sesji użytkownika do komponentu React.
- **Główne elementy:** Layout Astro, osadzenie komponentu klienckiego `RoadmapListContainer`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika; obsługuje ładowanie strony.
- **Obsługiwana walidacja:** Pośrednio przez middleware (autentykacja użytkownika).
- **Typy:** Dane sesji użytkownika (np. `userId`).
- **Propsy:** Brak (jest to komponent strony).

### `RoadmapListContainer` (React Component)
- **Lokalizacja:** `src/components/dashboard/RoadmapListContainer.tsx`
- **Opis komponentu:** Główny komponent React odpowiedzialny za pobieranie, wyświetlanie i zarządzanie listą roadmap. Obsługuje stan ładowania, błędy oraz inicjuje akcje związane z roadmapami (np. otwarcie dialogu potwierdzenia usunięcia). Wykorzystuje custom hook `useRoadmaps`.
- **Główne elementy:** Renderuje listę `RoadmapCard` oraz `DeleteConfirmationDialog`. Wyświetla komunikaty o ładowaniu lub błędach.
- **Obsługiwane interakcje:** Inicjowanie usuwania roadmapy.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji danych wejściowych; obsługuje stany ładowania/błędów z API.
- **Typy:** Wewnętrznie zarządza stanem opartym na `RoadmapSummaryDto[]`.
- **Propsy:** `userId: string` (przekazany z `DashboardPage` lub pobrany z kontekstu/sesji).

### `RoadmapCard` (React Component)
- **Lokalizacja:** `src/components/dashboard/RoadmapCard.tsx`
- **Opis komponentu:** Wyświetla informacje o pojedynczej roadmapie: tytuł, data utworzenia, poziom doświadczenia, technologia oraz (obliczony) procent postępu. Zawiera przyciski akcji: podgląd, edycja, usunięcie. Bazuje na komponencie `Card` z Shadcn/ui.
- **Główne elementy:** Elementy `div` lub `Card` z Shadcn/ui, `h3` (tytuł), `p` (data, technologia, poziom), `ProgressBar`, `Button` (akcje).
- **Obsługiwane interakcje:**
    - Kliknięcie przycisku "Podgląd": wywołuje `onPreview(roadmapId)`.
    - Kliknięcie przycisku "Edytuj": wywołuje `onEdit(roadmapId)`.
    - Kliknięcie przycisku "Usuń": wywołuje `onDelete(roadmapId, roadmapTitle)`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `RoadmapCardViewModel`.
- **Propsy:**
    - `roadmap: RoadmapCardViewModel`
    - `onPreview: (roadmapId: string) => void`
    - `onEdit: (roadmapId: string) => void`
    - `onDelete: (roadmapId: string, roadmapTitle: string) => void`

### `ProgressBar` (React Component - Shadcn/ui)
- **Lokalizacja:** `src/components/ui/progress.tsx` (zakładając standardową strukturę Shadcn/ui)
- **Opis komponentu:** Wizualizuje postęp procentowy roadmapy.
- **Główne elementy:** Zgodne z implementacją Shadcn/ui.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Wartość powinna być liczbą między 0 a 100.
- **Typy:** `number`.
- **Propsy:** `value: number` (procent postępu).

### `DeleteConfirmationDialog` (React Component)
- **Lokalizacja:** `src/components/dashboard/DeleteConfirmationDialog.tsx`
- **Opis komponentu:** Modal dialogowy z biblioteki Shadcn/ui (`Dialog`), proszący użytkownika o potwierdzenie przed usunięciem roadmapy. Wyświetla tytuł roadmapy, która ma zostać usunięta.
- **Główne elementy:** Komponent `Dialog` z Shadcn/ui, zawierający tytuł, treść pytania oraz przyciski "Potwierdź" i "Anuluj".
- **Obsługiwane interakcje:**
    - Kliknięcie "Potwierdź": wywołuje `onConfirm()`.
    - Kliknięcie "Anuluj" lub zamknięcie dialogu: wywołuje `onClose()`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych typów DTO; zarządza stanem `isOpen`.
- **Propsy:**
    - `isOpen: boolean`
    - `onClose: () => void`
    - `onConfirm: () => void`
    - `roadmapTitle: string | null` (tytuł roadmapy do usunięcia)

## 5. Typy
Kluczowe typy danych wykorzystywane w widoku:

- **`RoadmapSummaryDto` (z `src/types.ts`):**
  ```typescript
  export type RoadmapSummaryDto = Pick<
    Tables<"roadmaps">,
    "id" | "title" | "experience_level" | "technology" | "goals" | "created_at" | "updated_at"
  >;
  ```
- **`RoadmapListResponseDto` (z `src/types.ts`):** Spodziewany format odpowiedzi z API dla listy roadmap.
  ```typescript
  export interface RoadmapListResponseDto {
    data: RoadmapSummaryDto[];
  }
  ```
  **Uwaga:** Aktualna implementacja API w `src/pages/api/roadmaps.ts` zwraca `{ roadmaps: RoadmapSummaryDto[] }`. Backend **musi zostać zaktualizowany**, aby był zgodny z `RoadmapListResponseDto` (zwracał obiekt z kluczem `data`).

- **ViewModel: `RoadmapCardViewModel` (nowy typ):**
  ```typescript
  export interface RoadmapCardViewModel {
    id: string;
    title: string;
    formattedCreatedAt: string; // np. "24 lipca 2024"
    progressPercentage: number; // Wartość od 0 do 100
    experienceLevel: string;
    technology: string;
  }
  ```
  - `id`: `string` (z `RoadmapSummaryDto.id`)
  - `title`: `string` (z `RoadmapSummaryDto.title`)
  - `formattedCreatedAt`: `string` (pochodzi z `RoadmapSummaryDto.created_at`, sformatowana do czytelnej postaci)
  - `progressPercentage`: `number` (Wymaga kalkulacji. **Brak w `RoadmapSummaryDto`**. Najlepiej, aby backend obliczał i dostarczał tę wartość. W przeciwnym razie frontend będzie musiał wyświetlać wartość zastępczą (np. 0) lub potrzebne będą dodatkowe dane do jej obliczenia.)
  - `experienceLevel`: `string` (z `RoadmapSummaryDto.experience_level`)
  - `technology`: `string` (z `RoadmapSummaryDto.technology`)

## 6. Zarządzanie stanem
Stan widoku (lista roadmap, stan ładowania, błędy, stan dialogu usuwania) będzie zarządzany w komponencie `RoadmapListContainer`. Zalecane jest utworzenie custom hooka `useRoadmaps` w celu enkapsulacji logiki związanej z danymi roadmap.

- **Custom Hook: `useRoadmaps`**
  - **Lokalizacja:** `src/lib/hooks/useRoadmaps.ts` (proponowana)
  - **Cel:** Zarządzanie stanem i logiką pobierania oraz usuwania roadmap.
  - **Stan wewnętrzny:**
    - `roadmaps: RoadmapSummaryDto[]`
    - `isLoading: boolean`
    - `error: string | null`
  - **Funkcje eksportowane:**
    - `roadmaps: RoadmapSummaryDto[]`
    - `isLoading: boolean`
    - `error: string | null`
    - `fetchRoadmaps(): Promise<void>`
    - `deleteRoadmapAndUpdateList(roadmapId: string): Promise<void>` (nazwa sugeruje aktualizację listy po usunięciu)
  - **Użycie:** W `RoadmapListContainer`.

Stan dialogu `DeleteConfirmationDialog` (`isOpen`, `roadmapToDelete`) będzie zarządzany w `RoadmapListContainer` za pomocą standardowych hooków React (`useState`).

## 7. Integracja API

### Pobieranie listy roadmap
- **Endpoint:** `GET /api/roadmaps`
- **Opis:** Pobiera listę roadmap użytkownika.
- **Nagłówki:** `Authorization: Bearer <token>` (token JWT użytkownika).
- **Odpowiedź (200 OK - oczekiwana, zgodna z `RoadmapListResponseDto`):**
  ```json
  {
    "data": [
      { "id":"uuid", "title":"string", "experience_level":"string", "technology":"string", "goals":"string", "created_at":"timestamp", "updated_at":"timestamp" /* + ewentualnie progressPercentage */ }
    ]
  }
  ```
- **Kluczowe uwagi:**
    1.  Backend (`src/pages/api/roadmaps.ts`) **musi zostać zmodyfikowany**, aby:
        *   Zwracać odpowiedź w formacie `RoadmapListResponseDto` (obiekt z kluczem `data`).
        *   Pobierać `userId` z sesji/tokenu (np. `locals.user.id`), a nie hardkodować.
    2.  Backend powinien rozważyć dodanie pola `progressPercentage` do `RoadmapSummaryDto`.

### Usuwanie roadmapy
- **Endpoint:** `DELETE /api/roadmaps/{roadmapId}`
- **Opis:** Usuwa wybraną roadmapę.
- **Nagłówki:** `Authorization: Bearer <token>`.
- **Parametry ścieżki:** `roadmapId: string` (UUID roadmapy).
- **Odpowiedź:**
    - `204 No Content` lub `200 OK` (z potwierdzeniem) w przypadku sukcesu.
    - `404 Not Found` jeśli roadmapa nie istnieje lub nie należy do użytkownika.
    - `401 Unauthorized` / `403 Forbidden`.
- **Kluczowe uwagi:**
    1.  Ten endpoint **musi zostać stworzony** w backendzie (np. w `src/pages/api/roadmaps/[roadmapId].ts` lub poprzez modyfikację `src/pages/api/roadmaps.ts` do obsługi metody DELETE z dynamicznym segmentem).
    2.  Implementacja powinna wywoływać odpowiednią metodę w `dashboardService`.

## 8. Interakcje użytkownika
- **Ładowanie widoku:** Po przejściu na `/dashboard`, wyświetlany jest stan ładowania, a następnie lista roadmap.
- **Podgląd roadmapy:** Kliknięcie przycisku "Podgląd" na `RoadmapCard` przekierowuje użytkownika do widoku szczegółów danej roadmapy (np. `/roadmaps/{roadmapId}`).
- **Edycja roadmapy:** Kliknięcie przycisku "Edytuj" na `RoadmapCard` przekierowuje użytkownika do formularza edycji danej roadmapy (np. `/roadmaps/{roadmapId}/edit`).
- **Usuwanie roadmapy:**
    1. Użytkownik klika przycisk "Usuń" na `RoadmapCard`.
    2. Otwiera się `DeleteConfirmationDialog` z pytaniem o potwierdzenie i nazwą roadmapy.
    3. Jeśli użytkownik kliknie "Potwierdź", wysyłane jest żądanie DELETE do API. Po pomyślnym usunięciu, lista roadmap jest odświeżana, a dialog zamykany. Może pojawić się komunikat o sukcesie.
    4. Jeśli użytkownik kliknie "Anuluj" lub zamknie dialog, operacja jest przerywana.

## 9. Warunki i walidacja
- **Dostęp do widoku:** Tylko zalogowani użytkownicy mogą uzyskać dostęp do `/dashboard`. Middleware Astro (`src/middleware/index.ts`) powinno obsłużyć tę logikę, przekierowując niezalogowanych użytkowników.
- **Limit roadmap (US-009):** Chociaż główna logika limitu (max 5 roadmap) dotyczy tworzenia nowych roadmap, dashboard może to odzwierciedlać:
    - Można wyświetlić aktualną liczbę roadmap (np. `roadmaps.length`).
    - Jeśli na dashboardzie znajdowałby się przycisk "Utwórz nową roadmapę", mógłby być on wyłączony, gdy `roadmaps.length >= 5`.
- **Usuwanie:** Wymagane jest potwierdzenie od użytkownika przed wykonaniem operacji usunięcia.

## 10. Obsługa błędów
- **Błędy API (GET, DELETE):**
    - **401 Unauthorized / 403 Forbidden:** Przekierowanie na stronę logowania lub wyświetlenie komunikatu o braku uprawnień.
    - **404 Not Found (szczególnie przy DELETE):** Wyświetlenie komunikatu "Nie znaleziono roadmapy".
    - **500 Internal Server Error / Inne błędy serwera:** Wyświetlenie ogólnego komunikatu o błędzie (np. "Wystąpił błąd podczas ładowania danych. Spróbuj ponownie później.") i logowanie szczegółów błędu w konsoli deweloperskiej.
    - **Niezgodność formatu danych:** Jeśli API zwróci dane w nieoczekiwanym formacie (np. przed poprawkami backendu), komponent powinien to obsłużyć, wyświetlając błąd i logując problem.
- **Błędy sieciowe:** Wyświetlenie komunikatu "Błąd sieci. Sprawdź połączenie i spróbuj ponownie."
- **Brak roadmap:** Jeśli użytkownik nie ma żadnych roadmap, należy wyświetlić odpowiedni komunikat (np. "Nie masz jeszcze żadnych roadmap. Utwórz swoją pierwszą!") zamiast pustej listy.
- **Brak danych do obliczenia postępu:** Jeśli `progressPercentage` nie jest dostarczane przez backend, należy wyświetlić wartość zastępczą (0%, "N/A") lub ukryć pasek postępu, informując użytkownika.

## 11. Kroki implementacji
1.  **Konfiguracja projektu i zależności:**
    *   Upewnij się, że projekt Astro z React i TypeScript jest poprawnie skonfigurowany.
    *   Zainstaluj komponenty Shadcn/ui, jeśli jeszcze nie są: `Button`, `Card`, `Progress`, `Dialog`.
    ```bash
    npx shadcn-ui@latest add button card progress dialog
    ```
2.  **Aktualizacja backendu (Równolegle lub jako pierwszy krok):**
    *   **Konieczne:** Zmodyfikuj endpoint `GET /api/roadmaps` (`src/pages/api/roadmaps.ts`):
        *   Aktualizacja odpowiedzi API do formatu `RoadmapListResponseDto` (zawierającego klucz `data`).
        *   Użycie `userId` z sesji (np. `locals.user.id`) zamiast hardkodowania.
    *   **Konieczne:** Stwórz endpoint `DELETE /api/roadmaps/{roadmapId}`:
        *   Może to być nowy plik np. `src/pages/api/roadmaps/[roadmapId].ts` obsługujący metodę `DELETE`.
        *   Implementacja logiki usuwania w `dashboardService`.
    *   **Zalecane:** Dodaj pole `progressPercentage` do `RoadmapSummaryDto` (obliczane na backendzie).
3.  **Definicja typów:**
    *   Stwórz `RoadmapCardViewModel` w `src/types.ts` lub w pliku komponentu `RoadmapCard.tsx`.
    *   Zweryfikuj istniejące typy (`RoadmapSummaryDto`, `RoadmapListResponseDto`) pod kątem zgodności.
4.  **Implementacja Middleware (jeśli nie istnieje/niekompletne):**
    *   W `src/middleware/index.ts` zaimplementuj ochronę trasy `/dashboard`, przekierowując niezalogowanych użytkowników. Upewnij się, że dane użytkownika (np. `userId`) są dostępne w `Astro.locals`.
5.  **Implementacja Strony Astro (`DashboardPage`):**
    *   Stwórz plik `src/pages/dashboard.astro`.
    *   Dodaj podstawowy layout i osadź komponent React `RoadmapListContainer`, przekazując `userId` (np. z `Astro.locals.user.id`).
6.  **Implementacja Custom Hooka (`useRoadmaps`):**
    *   Stwórz `src/lib/hooks/useRoadmaps.ts`.
    *   Zaimplementuj logikę pobierania (`fetchRoadmaps`) i usuwania (`deleteRoadmapAndUpdateList`) roadmap, zarządzanie stanem (`roadmaps`, `isLoading`, `error`).
    *   Funkcje API powinny korzystać z globalnego klienta API (jeśli istnieje) lub `fetch` z odpowiednimi nagłówkami (w tym `Authorization`).
7.  **Implementacja Komponentów React:**
    *   **`RoadmapListContainer.tsx`:**
        *   Użyj hooka `useRoadmaps` do pobierania danych i zarządzania stanem.
        *   Renderuj `RoadmapCard` dla każdej roadmapy.
        *   Obsłuż stany ładowania i błędów.
        *   Zarządzaj stanem i logiką `DeleteConfirmationDialog`.
    *   **`RoadmapCard.tsx`:**
        *   Przyjmij `roadmap: RoadmapCardViewModel` i funkcje zwrotne jako propsy.
        *   Wyświetl dane roadmapy, w tym `ProgressBar`.
        *   Implementacja funkcji pomocniczej do formatowania `created_at` na `formattedCreatedAt`.
        *   Implementacja funkcji pomocniczej do mapowania `RoadmapSummaryDto` na `RoadmapCardViewModel` (może być w `useRoadmaps` lub w kontenerze).
        *   Podłącz akcje przycisków do przekazanych propsów (`onPreview`, `onEdit`, `onDelete`).
    *   **`DeleteConfirmationDialog.tsx`:**
        *   Przyjmij `isOpen`, `onClose`, `onConfirm`, `roadmapTitle` jako propsy.
        *   Użyj komponentu `Dialog` z Shadcn/ui.
8.  **Styling:**
    *   Użyj Tailwind CSS do stylizacji komponentów zgodnie z wymaganiami i ogólnym wyglądem aplikacji.
    *   Wykorzystaj predefiniowane style komponentów Shadcn/ui.
9.  **Nawigacja:**
    *   Implementacja logiki nawigacji dla akcji "Podgląd" i "Edytuj" (np. za pomocą `Astro.redirect` lub `window.location.href` w zależności od kontekstu Astro/React).
10. **Testowanie:**
    *   Przetestuj wszystkie interakcje użytkownika: ładowanie listy, otwieranie i potwierdzanie/anulowanie dialogu usuwania, faktyczne usuwanie.
    *   Przetestuj obsługę błędów API i stanów ładowania.
    *   Sprawdź ochronę trasy.
    *   Sprawdź wyświetlanie danych, w tym formatowanie daty i (gdy dostępne) postępu.
    *   Przetestuj responsywność widoku.
11. **Refaktoryzacja i Optymalizacja:**
    *   Przejrzyj kod pod kątem czytelności, wydajności i zgodności z najlepszymi praktykami.
    *   Upewnij się, że wszystkie typy są poprawnie używane.
    *   Zoptymalizuj renderowanie komponentów React, jeśli to konieczne (np. `React.memo`).
```