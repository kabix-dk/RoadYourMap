# Plan implementacji widoku: Szczegóły Roadmapy

## 1. Przegląd

Widok "Szczegóły Roadmapy" ma na celu umożliwienie użytkownikom przeglądania szczegółowej struktury wygenerowanej roadmapy oraz śledzenia swoich postępów w nauce. Użytkownik będzie mógł zobaczyć całą hierarchię kroków, oznaczać poszczególne elementy jako ukończone i obserwować, jak jego postęp jest wizualizowany na pasku postępu. Interakcje użytkownika, takie jak oznaczanie postępów, są zapisywane natychmiastowo, zapewniając płynne i responsywne doświadczenie.

## 2. Routing widoku

Widok będzie dostępny pod dynamiczną ścieżką, która zawiera unikalny identyfikator danej roadmapy.

- **Ścieżka**: `/roadmaps/[id]`
- **Przykład**: `/roadmaps/1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d`

Strona powinna być chroniona. W przypadku braku aktywnej sesji użytkownika, Astro middleware powinno przekierować go na stronę logowania `/login`.

## 3. Struktura komponentów

Hierarchia komponentów zostanie zaimplementowana w React i osadzona na stronie Astro (`.astro`) z dyrektywą `client:load`.

```
- /src/pages/roadmaps/[id].astro (Strona Astro)
  - /src/components/views/RoadmapDetailsView.tsx (Główny komponent React)
    - /src/components/features/RoadmapHeader.tsx (Nagłówek z tytułem)
    - /src/components/features/RoadmapProgress.tsx (Pasek postępu)
    - /src/components/features/RoadmapItemsList.tsx (Lista elementów roadmapy)
      - /src/components/features/RoadmapItem.tsx (Pojedynczy element roadmapy - rekurencyjny)
        - /src/components/ui/Checkbox.tsx (Checkbox do oznaczania postępu)
        - RoadmapItemsList.tsx (Dla zagnieżdżonych dzieci)
```

## 4. Szczegóły komponentów

### `RoadmapDetailsView.tsx`
- **Opis**: Główny kontener widoku, odpowiedzialny za pobranie danych, zarządzanie stanem i koordynację komponentów podrzędnych. Wykorzystuje customowy hook `useRoadmapDetails` do całej logiki.
- **Główne elementy**: Wyświetla komponenty `RoadmapHeader`, `RoadmapProgress` i `RoadmapItemsList` lub komunikaty o ładowaniu/błędach.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji. Deleguje obsługę zdarzeń do hooka.
- **Typy**: `RoadmapDetailsDto`, `RoadmapItemViewModel`
- **Propsy**: `{ roadmapId: string }`

### `RoadmapHeader.tsx`
- **Opis**: Komponent prezentacyjny wyświetlający tytuł i opcjonalnie inne metadane roadmapy (np. technologia, poziom zaawansowania).
- **Główne elementy**: `<h1>` dla tytułu, `<p>` dla metadanych.
- **Obsługiwane interakcje**: Brak.
- **Typy**: `Pick<RoadmapDetailsDto, 'title' | 'technology' | 'experience_level'>`
- **Propsy**: `{ roadmap: Pick<RoadmapDetailsDto, 'title' | 'technology' | 'experience_level'> }`

### `RoadmapProgress.tsx`
- **Opis**: Wizualizuje ogólny postęp ukończenia roadmapy w procentach.
- **Główne elementy**: Wykorzystuje komponent `<ProgressBar>` z biblioteki Shadcn/ui.
- **Obsługiwane interakcje**: Brak.
- **Typy**: `number`
- **Propsy**: `{ value: number }`

### `RoadmapItemsList.tsx`
- **Opis**: Renderuje listę elementów roadmapy. Odpowiedzialny za iterowanie po elementach i przekazywanie ich do `RoadmapItem`.
- **Główne elementy**: Wrapper `div`, który mapuje tablicę `items` na komponenty `RoadmapItem`. Może być zintegrowany z `<Accordion>` z Shadcn/ui, aby zarządzać stanem rozwinięcia wszystkich elementów.
- **Obsługiwane interakcje**: Przekazuje w dół handler `onToggleComplete`.
- **Typy**: `RoadmapItemViewModel[]`
- **Propsy**: `{ items: RoadmapItemViewModel[]; onToggleComplete: (itemId: string, isCompleted: boolean) => void; }`

### `RoadmapItem.tsx`
- **Opis**: Reprezentuje pojedynczy, potencjalnie zagnieżdżony, element roadmapy. Umożliwia rozwijanie/zwijanie w przypadku posiadania dzieci oraz oznaczanie jako ukończony.
- **Główne elementy**: Wykorzystuje komponenty `<AccordionItem>`, `<AccordionTrigger>`, `<AccordionContent>` z Shadcn/ui. Wewnątrz znajduje się `<Checkbox>` oraz tytuł elementu. Rekurencyjnie renderuje `RoadmapItemsList` dla elementów `children`.
- **Obsługiwane interakcje**:
  - Kliknięcie na checkbox: wywołuje `onToggleComplete` z `id` elementu i nowym statusem.
  - Kliknięcie na nagłówek: rozwija/zwija listę zagnieżdżonych elementów.
- **Typy**: `RoadmapItemViewModel`
- **Propsy**: `{ item: RoadmapItemViewModel; onToggleComplete: (itemId: string, isCompleted: boolean) => void; }`

## 5. Typy

Oprócz typów DTO zdefiniowanych w `src/types.ts` (`RoadmapDetailsDto`, `RoadmapItemDto`), potrzebny będzie kliencki ViewModel do reprezentacji hierarchicznej struktury.

```typescript
// Plik: src/components/views/RoadmapDetailsView.types.ts

import type { RoadmapItemDto } from "@/types";

/**
 * Rozszerza standardowy DTO elementu roadmapy o zagnieżdżoną listę
 * dzieci tego samego typu, aby umożliwić rekurencyjne renderowanie
 * struktury drzewa.
 */
export interface RoadmapItemViewModel extends RoadmapItemDto {
  children: RoadmapItemViewModel[];
}
```

## 6. Zarządzanie stanem

Cała logika stanu zostanie zamknięta w customowym hooku `useRoadmapDetails`, aby utrzymać komponent `RoadmapDetailsView` czystym i skoncentrowanym na renderowaniu.

**Custom Hook: `useRoadmapDetails(roadmapId: string)`**

- **Cel**: Enkapsulacja logiki pobierania danych, ich transformacji, obsługi interakcji (optimistic updates) i obliczania postępu.
- **Zarządzany stan**:
  - `roadmap: RoadmapDetailsDto | null`
  - `tree: RoadmapItemViewModel[]`
  - `isLoading: boolean`
  - `error: string | null`
  - `progress: number`
- **Udostępniane funkcje**:
  - `toggleItemCompletion(itemId: string, isCompleted: boolean)`: Funkcja odpowiedzialna za optymistyczną aktualizację UI, obliczenie nowego postępu i wywołanie API `PATCH`. W przypadku błędu API, przywraca poprzedni stan i wyświetla komunikat błędu (np. przez toast).

## 7. Integracja API

Integracja będzie opierać się na dwóch endpointach API.

1.  **Pobieranie danych roadmapy**:
    - **Endpoint**: `GET /api/roadmaps/:roadmapId`
    - **Akcja**: Wywoływane przy pierwszym renderowaniu komponentu w `useEffect` wewnątrz hooka `useRoadmapDetails`.
    - **Typ odpowiedzi**: `{ roadmap: RoadmapDetailsDto }`

2.  **Aktualizacja statusu elementu**:
    - **Endpoint**: `PATCH /api/roadmaps/:roadmapId/items/:itemId`
    - **Akcja**: Wywoływane przez funkcję `toggleItemCompletion`, gdy użytkownik kliknie checkbox.
    - **Typ żądania (body)**: `UpdateRoadmapItemCommand`, czyli `{ is_completed: boolean }`
    - **Typ odpowiedzi**: `RoadmapItemRecordDto` (zaktualizowany obiekt elementu)

## 8. Interakcje użytkownika

- **Ładowanie widoku**: Użytkownik widzi wskaźnik ładowania. Po załadowaniu danych, wyświetlana jest pełna roadmapa.
- **Oznaczanie elementu**: Użytkownik klika na checkbox. UI natychmiast się aktualizuje (checkbox zmienia stan, pasek postępu się przesuwa). W tle wysyłane jest żądanie do API w celu zapisania zmiany.
- **Przeglądanie hierarchii**: Użytkownik klika na element nadrzędny, co powoduje płynne rozwinięcie/zwinięcie listy jego elementów podrzędnych.

## 9. Warunki i walidacja

- **Uwierzytelnienie**: Weryfikacja na poziomie strony Astro (`Astro.locals.user`). Brak sesji powoduje przekierowanie do `/login`.
- **Poprawność `roadmapId`**: Podstawowa walidacja formatu UUID parametru `id` może odbyć się na poziomie strony Astro, aby uniknąć niepotrzebnego renderowania komponentu React i wywołania API z błędnym formatem.

## 10. Obsługa błędów

- **Błąd pobierania danych (np. 404, 500, błąd sieci)**: Hook `useRoadmapDetails` ustawia stan `error`. Komponent `RoadmapDetailsView` wyświetla czytelną dla użytkownika informację o błędzie z prośbą o odświeżenie strony.
- **Błąd aktualizacji (PATCH)**: Zmiana w UI jest cofana (stan checkboxa wraca do poprzedniego). Wyświetlany jest globalny, nietrwały komunikat (toast) informujący o niepowodzeniu zapisu i zachęcający do ponownej próby.
- **Brak autoryzacji (401)**: Jeśli token wygaśnie w trakcie sesji, hook powinien to wykryć i programowo przekierować użytkownika do strony logowania.

## 11. Kroki implementacji

1.  **Struktura plików**: Utwórz plik strony `/src/pages/roadmaps/[id].astro`.
2.  **Ochrona trasy**: W pliku `.astro` dodaj logikę sprawdzającą `Astro.locals.user` i przekierowującą w razie potrzeby.
3.  **Typy**: Zdefiniuj typ `RoadmapItemViewModel` w dedykowanym pliku.
4.  **Komponenty UI**: Stwórz szkielety komponentów React: `RoadmapDetailsView`, `RoadmapHeader`, `RoadmapProgress`, `RoadmapItemsList`, `RoadmapItem`.
5.  **Logika transformacji danych**: Zaimplementuj funkcję pomocniczą `buildRoadmapTree(items: RoadmapItemDto[]): RoadmapItemViewModel[]`, która przekształci płaską listę z API w strukturę drzewa.
6.  **Custom Hook**: Zaimplementuj hak `useRoadmapDetails(roadmapId)`. Wewnątrz niego umieść logikę `useEffect` do pobierania danych (`GET`), stany `useState` oraz funkcję `toggleItemCompletion`.
7.  **Implementacja komponentów**: Wypełnij komponenty logiką renderowania, używając danych i funkcji z hooka `useRoadmapDetails`. Zintegruj komponenty z biblioteki Shadcn/ui (`ProgressBar`, `Accordion`, `Checkbox`).
8.  **Połączenie Astro i React**: W pliku `[id].astro` zaimportuj i wyrenderuj komponent `RoadmapDetailsView`, przekazując `roadmapId` jako props i dodając dyrektywę `client:load`.
9.  **Obsługa błędów**: Zaimplementuj renderowanie komunikatów o błędach w `RoadmapDetailsView` oraz system toastów dla błędów `PATCH`.
10. **Stylowanie i testowanie**: Dopracuj wygląd za pomocą Tailwind CSS i przetestuj wszystkie interakcje użytkownika oraz scenariusze błędów. 