# Plan implementacji widoku: Podgląd Wygenerowanej Roadmapy

## 1. Przegląd
Widok "Podgląd Wygenerowanej Roadmapy" służy do prezentacji użytkownikowi struktury roadmapy, która została właśnie wygenerowana przez system AI. Umożliwia przeglądanie elementów roadmapy w hierarchicznej, rozwijanej strukturze (drzewo 2-3 poziomowe). Kluczowe funkcjonalności tego widoku to wyświetlanie tytułów i opisów poszczególnych kroków, możliwość edycji tych treści w miejscu (inline editing) oraz zmiana kolejności elementów za pomocą mechanizmu przeciągnij i upuść (drag-and-drop). Celem jest umożliwienie użytkownikowi dostosowania wstępnie wygenerowanej roadmapy do swoich preferencji przed jej finalnym zapisaniem.

## 2. Routing widoku
Widok powinien być dostępny pod następującą ścieżką:
- `/roadmaps/preview`

Dane do tego widoku (obiekt `RoadmapDetailsDto`) są przekazywane prawdopodobnie ze stanu aplikacji po pomyślnym wygenerowaniu roadmapy przez endpoint `POST /api/roadmaps/generate`.

## 3. Struktura komponentów
Komponenty będą budowane z wykorzystaniem React (dla interaktywności) w ramach strony Astro.

```
RoadmapPreviewPage (Astro Page: /roadmaps/preview)
  └── RoadmapDisplay (React Component) - Główny kontener dla roadmapy
      ├── DndContext (z biblioteki dnd-kit) - Kontekst dla drag-and-drop
      │   └── RoadmapItemNode (React Component) - Reprezentuje pojedynczy element roadmapy (rekurencyjnie lub iteracyjnie)
      │       ├── Elementy do wyświetlania tytułu i opisu (np. <p>, <span>)
      │       ├── InlineTextEdit (React Component) - Dla edycji tytułu
      │       ├── InlineTextEdit (React Component) - Dla edycji opisu
      │       ├── (Opcjonalnie) AccordionTrigger/Header (do rozwijania/zwijania dzieci)
      │       └── (Miejsce na renderowanie dzieci - kolejne instancje RoadmapItemNode)
      ├── Spinner (React Component) - Wyświetlany podczas ładowania/inicjalizacji danych
      └── (Opcjonalnie) Przycisk "Zapisz zmiany" lub "Potwierdź roadmapę"
```

- **`RoadmapPreviewPage.astro`**: Strona Astro, która osadza komponent React `RoadmapDisplay` i przekazuje mu dane roadmapy.
- **`RoadmapDisplay.tsx`**: Główny komponent React, który otrzymuje dane roadmapy, zarządza jej stanem (w tym transformacją do struktury drzewiastej), inicjalizuje `DndContext` i renderuje listę/drzewo elementów `RoadmapItemNode`. Odpowiada za logikę DND (przesuwanie elementów).
- **`RoadmapItemNode.tsx`**: Komponent React reprezentujący pojedynczy węzeł (element) roadmapy. Wyświetla jego tytuł i opis, obsługuje rozwijanie/zwijanie (jeśli ma dzieci), umożliwia edycję inline tytułu/opisu poprzez komponent `InlineTextEdit`, i jest elementem przeciągalnym/upuszczalnym w ramach `DndContext`.
- **`InlineTextEdit.tsx`**: Generyczny komponent React do edycji tekstu w miejscu. Po kliknięciu na tekst, zamienia go na pole input/textarea. Po utracie fokusa lub zatwierdzeniu, wywołuje callback z nową wartością.
- **`Spinner.tsx`**: Prosty komponent React wyświetlający animację ładowania.

## 4. Szczegóły komponentów

### `RoadmapPreviewPage.astro`
- **Opis komponentu**: Strona Astro hostująca widok podglądu roadmapy. Odpowiada za integrację komponentu React z systemem stron Astro i przekazanie mu początkowych danych roadmapy (prawdopodobnie z `Astro.props` lub store'a po stronie klienta).
- **Główne elementy**: Layout Astro, osadzony komponent React `<RoadmapDisplay client:load />`.
- **Obsługiwane interakcje**: Brak bezpośrednich, deleguje do `RoadmapDisplay`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Przyjmuje `RoadmapDetailsDto` jako prop lub pobiera ze store.
- **Propsy**: `roadmapData: RoadmapDetailsDto`.

### `RoadmapDisplay.tsx` (React)
- **Opis komponentu**: Sercem widoku jest ten komponent. Zarządza całym stanem wyświetlanej i edytowanej roadmapy. Inicjalizuje `DndContext` i obsługuje logikę zmiany kolejności oraz struktury elementów (`handleDragEnd`). Renderuje listę elementów roadmapy za pomocą `RoadmapItemNode`.
- **Główne elementy**: `DndContext` (wrapper), mapowanie `roadmapViewData.rootItems` do komponentów `RoadmapItemNode`. Może zawierać przycisk do zapisu zmian, jeśli taka funkcjonalność jest przewidziana w tym widoku.
- **Obsługiwane interakcje**: Przeciąganie i upuszczanie elementów (`onDragEnd` z `dnd-kit`). Potencjalnie akcja zapisu zmian.
- **Obsługiwana walidacja**: Przy operacji DND - zapobieganie tworzeniu niepoprawnej struktury (np. przekroczenie limitu poziomów zagnieżdżenia).
- **Typy**: `RoadmapViewData`, `RoadmapItemViewModel`.
- **Propsy**: `initialRoadmapData: RoadmapDetailsDto`.

### `RoadmapItemNode.tsx` (React)
- **Opis komponentu**: Reprezentuje pojedynczy element (węzeł) w drzewie roadmapy. Wyświetla tytuł i opis, umożliwia ich edycję inline. Jeśli element ma dzieci, pozwala na ich rozwijanie/zwijanie. Jest to element, który można przeciągać i na który można upuszczać inne elementy.
- **Główne elementy**: Kontener (np. `div` lub `Accordion.Item` z Shadcn/ui), `InlineTextEdit` dla tytułu, `InlineTextEdit` dla opisu, ikona do przeciągania, ikona do rozwijania/zwijania (jeśli są dzieci), kontener na renderowanie dzieci (kolejne `RoadmapItemNode`).
- **Obsługiwane interakcje**:
    - Rozpoczęcie edycji tytułu/opisu (kliknięcie).
    - Zapisanie/anulowanie edycji tytułu/opisu.
    - Rozwinięcie/zwinięcie dzieci (kliknięcie).
    - Bycie źródłem przeciągania (`useDraggable`).
    - Bycie celem upuszczania (`useDroppable`).
- **Obsługiwana walidacja**: Walidacja edytowanego tytułu (np. niepusty, limit znaków).
- **Typy**: `RoadmapItemViewModel`, `(id: string, newTitle: string) => void` (callback `onTitleChange`), `(id: string, newDescription: string) => void` (callback `onDescriptionChange`), `(id: string) => void` (callback `onToggleExpand`).
- **Propsy**:
    - `item: RoadmapItemViewModel` (dane elementu)
    - `onTitleUpdate: (itemId: string, newTitle: string) => void`
    - `onDescriptionUpdate: (itemId: string, newDescription: string) => void`
    - `onToggleExpand: (itemId: string) => void`
    - `path: string` (ścieżka do elementu w drzewie, pomocne przy DND)

### `InlineTextEdit.tsx` (React)
- **Opis komponentu**: Komponent UI do edycji tekstu "w miejscu". Wyświetla tekst, a po kliknięciu zamienia go na pole input lub textarea.
- **Główne elementy**: Warunkowo renderowany `span`/`p` (tryb wyświetlania) lub `input`/`textarea` (tryb edycji).
- **Obsługiwane interakcje**: Kliknięcie aby rozpocząć edycję, `onBlur` lub `Enter` aby zapisać, `Escape` aby anulować.
- **Obsługiwana walidacja**: Może przyjmować `validate` prop (funkcję walidującą). Komunikat o błędzie wyświetlany przy niepoprawnej wartości.
- **Typy**: `string` (value), `(newValue: string) => void` (onSave).
- **Propsy**:
    - `initialValue: string`
    - `onSave: (newValue: string) => void`
    - `multiline?: boolean` (czy użyć textarea)
    - `validate?: (value: string) => string | null` (funkcja zwracająca komunikat błędu lub null)
    - `placeholder?: string`
    - `className?: string`

## 5. Typy
Kluczowe typy danych pochodzą z `src/types.ts` oraz niestandardowe typy ViewModel dla potrzeb frontendu.

*   **DTO (z `src/types.ts`):**
    *   `RoadmapDetailsDto`: Główny obiekt danych dla widoku, otrzymywany po generacji roadmapy.
        *   `id: string` (UUID)
        *   `title: string`
        *   `experience_level: string`
        *   `technology: string`
        *   `goals: string`
        *   `additional_info: string | null`
        *   `created_at: string` (timestamp)
        *   `updated_at: string` (timestamp)
        *   `items: RoadmapItemDto[]`
    *   `RoadmapItemDto`: Definicja pojedynczego elementu roadmapy w płaskiej liście.
        *   `id: string` (UUID)
        *   `parent_item_id: string | null` (UUID)
        *   `title: string`
        *   `description: string | null`
        *   `level: number` (poziom zagnieżdżenia)
        *   `position: number` (kolejność w ramach rodzeństwa)
        *   `is_completed: boolean`
        *   `completed_at: string | null` (timestamp)

*   **Niestandardowe Typy ViewModel (Frontend):**
    *   `RoadmapItemViewModel`: Rozszerzona wersja `RoadmapItemDto` dostosowana do potrzeb UI i struktury drzewiastej.
        *   `id: string`
        *   `parentId: string | null` (alias `parent_item_id`)
        *   `title: string`
        *   `description: string | null`
        *   `level: number`
        *   `position: number`
        *   `isCompleted: boolean` (alias `is_completed`)
        *   `children: RoadmapItemViewModel[]` (tablica dzieci, budująca strukturę drzewa)
        *   `isExpanded: boolean` (stan UI: czy element jest rozwinięty)
        *   `isEditingTitle: boolean` (stan UI: czy tytuł jest edytowany)
        *   `isEditingDescription: boolean` (stan UI: czy opis jest edytowany)

    *   `RoadmapViewData`: Struktura danych reprezentująca całą roadmapę gotową do wyświetlenia w formie drzewa.
        *   `id: string` (ID całej roadmapy)
        *   `title: string` (tytuł całej roadmapy)
        *   // ...inne metadane z `RoadmapDetailsDto` (experience_level, technology, etc.)
        *   `rootItems: RoadmapItemViewModel[]` (elementy roadmapy najwyższego poziomu, każdy może zawierać `children`)

    Niezbędna będzie funkcja transformująca `RoadmapDetailsDto` (z płaską listą `items`) na `RoadmapViewData` (z hierarchiczną strukturą `rootItems` i `children` w każdym `RoadmapItemViewModel`). Ta funkcja zbuduje drzewo na podstawie `parent_item_id`.

## 6. Zarządzanie stanem
Stan roadmapy (jej struktura, treść elementów, stany edycji, rozwinięcia) będzie zarządzany w głównym komponencie React `RoadmapDisplay.tsx`.

*   **Główne zmienne stanu w `RoadmapDisplay`:**
    *   `roadmapViewData: RoadmapViewData | null`: Przechowuje przetworzone, hierarchiczne dane roadmapy.
    *   `isLoading: boolean`: Wskazuje, czy dane są przetwarzane/ładowane.
    *   `error: string | null`: Komunikat o błędzie.
    *   `activeDragId: string | null`: ID aktualnie przeciąganego elementu (dla `dnd-kit`).

*   **Niestandardowy hook `useRoadmapManager(initialData: RoadmapDetailsDto)`:**
    *   Cel: Enkapsulacja logiki zarządzania stanem roadmapy. Odpowiedzialny za:
        *   Transformację `initialData` do `RoadmapViewData`.
        *   Dostarczanie funkcji do modyfikacji stanu:
            *   `updateItemTitle(itemId: string, newTitle: string)`
            *   `updateItemDescription(itemId: string, newDescription: string)`
            *   `toggleExpand(itemId: string)`
            *   `moveItem(draggedId: string, targetParentId: string | null, newPosition: number)` - logika zmiany kolejności i rodzica.
    *   Zwraca: `[roadmapViewData, actions]`, gdzie `actions` to obiekt z powyższymi funkcjami.
    *   Użycie: W `RoadmapDisplay.tsx`.

Poszczególne `RoadmapItemNode` mogą mieć minimalny stan lokalny (np. dla `InlineTextEdit` wartość tymczasowa podczas edycji), ale główne zmiany będą propagowane do `RoadmapDisplay` przez callbacki i zarządzane przez hook `useRoadmapManager`.

## 7. Integracja API
Widok `/roadmaps/preview` bezpośrednio nie inicjuje wywołania `POST /api/roadmaps/generate`. Otrzymuje dane jako wynik tego wywołania, które nastąpiło wcześniej (z formularza tworzenia roadmapy).

Jeśli widok "Podgląd Wygenerowanej Roadmapy" umożliwia zapisanie dokonanych modyfikacji (edycja inline, zmiana kolejności), konieczne będą wywołania do API w celu aktualizacji roadmapy. Ponieważ `POST /api/roadmaps/generate` tworzy *nową* roadmapę, kolejne zmiany powinny być wysyłane do endpointów aktualizujących:

*   **`PATCH /api/roadmaps/{roadmapId}`**
    *   Typ żądania: `UpdateRoadmapCommand` (z `src/types.ts`)
    *   Opis: Do aktualizacji ogólnych danych roadmapy (jeśli dotyczy, np. zmiana głównego tytułu).
*   **`PATCH /api/roadmaps/{roadmapId}/items/{itemId}`**
    *   Typ żądania: `UpdateRoadmapItemCommand` (z `src/types.ts`)
    *   Opis: Do aktualizacji pojedynczego elementu roadmapy (tytuł, opis, pozycja, `is_completed`).
*   **`POST /api/roadmaps/{roadmapId}/items`**
    *   Typ żądania: `CreateRoadmapItemCommand`
    *   Opis: Jeśli w tym widoku będzie można dodawać nowe elementy.
*   **`DELETE /api/roadmaps/{roadmapId}/items/{itemId}`**
    *   Opis: Jeśli w tym widoku będzie można usuwać elementy.

**W kontekście MVP dla podglądu świeżo wygenerowanej roadmapy:**
Głównym zadaniem jest wyświetlenie danych. Jeśli edycja i DND są zaimplementowane, stan jest modyfikowany lokalnie. Użytkownik powinien mieć możliwość "zatwierdzenia" lub "zapisania" tej zmodyfikowanej roadmapy. Ta akcja "Zapisz" wywołałaby odpowiednie endpointy PATCH, używając `roadmap.id` otrzymanego z odpowiedzi `POST /api/roadmaps/generate`.

**Typy danych dla `POST /api/roadmaps/generate` (relevantne, bo to źródło danych):**
*   Request Body: `CreateRoadmapCommand` (z `src/types.ts`)
    ```json
    {
      "title": "string",
      "experience_level": "string",
      "technology": "string",
      "goals": "string",
      "additional_info": "string" // optional
    }
    ```
*   Response (201 Created): Obiekt zawierający `roadmap: RoadmapDetailsDto`
    ```json
    {
      "roadmap": {
        "id":"uuid", // Ważne dla przyszłych aktualizacji
        "title":"string",
        "experience_level":"string",
        // ...inne pola
        "items": [ // RoadmapItemDto[]
          { "id":"uuid", "parent_item_id": "uuid | null", "title":"string", ... }
        ]
      }
    }
    ```
Frontend musi poprawnie zmapować `items.completed_at: null` (z implementacji endpointu) na `is_completed: false` (zgodnie z `RoadmapItemDto`).

## 8. Interakcje użytkownika
- **Przeglądanie roadmapy**: Użytkownik widzi hierarchiczną listę.
- **Rozwijanie/Zwijanie elementów**: Kliknięcie na nagłówek/ikonę elementu z dziećmi rozwija lub zwija listę jego dzieci. Stan `isExpanded` w `RoadmapItemViewModel` jest aktualizowany.
- **Edycja inline tytułu/opisu**:
    - Kliknięcie na tekst tytułu/opisu aktywuje tryb edycji (`InlineTextEdit`).
    - Wprowadzenie zmian.
    - Zapisanie (onBlur, Enter) aktualizuje `title`/`description` w `RoadmapItemViewModel` poprzez `useRoadmapManager`.
    - Anulowanie (Escape) odrzuca zmiany.
- **Zmiana kolejności/struktury (Drag and Drop)**:
    - Użytkownik chwyta element (handle DND).
    - Przeciąga element na nową pozycję (wśród rodzeństwa lub do innego rodzica, jeśli dozwolone).
    - Upuszczenie elementu wyzwala logikę w `handleDragEnd` w `RoadmapDisplay`.
    - Stan `roadmapViewData` jest aktualizowany (zmiana `parent_item_id`, `position`, `level` dla przesuwanych elementów i ich rodzeństwa).
- **(Opcjonalnie) Zapisanie zmian**: Kliknięcie przycisku "Zapisz" wysyła zmodyfikowane dane `roadmapViewData` do backendu poprzez odpowiednie endpointy PATCH.

## 9. Warunki i walidacja
- **Walidacja edytowanego tytułu elementu roadmapy**:
    - Komponent: `InlineTextEdit` używany w `RoadmapItemNode`.
    - Warunek: Tytuł nie może być pusty. Może obowiązywać limit znaków (np. 255).
    - Wpływ na UI: Komunikat o błędzie przy polu edycji, blokada zapisu niepoprawnej wartości. Zmiana nie jest propagowana do stanu globalnego, dopóki walidacja nie przejdzie.
- **Walidacja edytowanego opisu elementu roadmapy**:
    - Komponent: `InlineTextEdit` używany w `RoadmapItemNode`.
    - Warunek: Może obowiązywać limit znaków.
    - Wpływ na UI: Jak wyżej.
- **Walidacja struktury przy DND**:
    - Komponent: Logika w `handleDragEnd` w `RoadmapDisplay` (lub hooku `useRoadmapManager`).
    - Warunek: Utrzymanie maksymalnej głębokości drzewa (2-3 poziomy, zgodnie z PRD). Element nie może być dzieckiem samego siebie ani swojego potomka.
    - Wpływ na UI: Jeśli operacja DND prowadziłaby do niepoprawnej struktury, jest blokowana, a element wraca na poprzednie miejsce. Możliwy komunikat dla użytkownika.
- **Sanityzacja treści XSS**:
    - Gdzie: Przy zapisie danych z `InlineTextEdit` do stanu i przed wysłaniem do API.
    - Jak: Użycie biblioteki typu `DOMPurify` lub zapewnienie, że dane są zawsze traktowane jako tekst, a nie HTML przy renderowaniu.

## 10. Obsługa błędów
- **Błąd ładowania/przekazania danych roadmapy**:
    - Objaw: Widok nie może wyświetlić roadmapy, bo nie otrzymał danych lub są one niekompletne/uszkodzone.
    - Obsługa: `RoadmapDisplay` wyświetla komunikat błędu (np. "Nie udało się załadować danych roadmapy. Spróbuj wygenerować ją ponownie.") zamiast struktury roadmapy.
- **Błąd walidacji inline**:
    - Objaw: Użytkownik wprowadza niepoprawny tytuł (np. pusty).
    - Obsługa: `InlineTextEdit` wyświetla komunikat błędu obok pola. Zapis jest blokowany do czasu poprawienia.
- **Błąd operacji DND (niedozwolone miejsce upuszczenia)**:
    - Objaw: Użytkownik próbuje upuścić element w sposób naruszający logikę (np. przekroczenie głębokości).
    - Obsługa: Operacja jest anulowana (element wraca na miejsce). Można wyświetlić krótkie powiadomienie (toast) wyjaśniające problem.
- **Błąd zapisu zmian do API (jeśli zaimplementowano zapis z tego widoku)**:
    - Objaw: Próba zapisu (PATCH) kończy się błędem serwera (4xx, 5xx).
    - Obsługa: Wyświetlenie globalnego komunikatu o błędzie (np. toast "Nie udało się zapisać zmian. Spróbuj ponownie.") Zmiany w UI nie są cofane, aby użytkownik mógł ponowić próbę. Szczegółowe błędy logowane do konsoli.
- **Ochrona XSS**:
    - Obsługa: Wszelkie dane wejściowe od użytkownika (tytuły, opisy) muszą być sanitizowane przed renderowaniem jako HTML lub przed zapisem do bazy danych. Użycie `textContent` zamiast `innerHTML` tam, gdzie to możliwe, lub bibliotek jak `DOMPurify`.

## 11. Kroki implementacji
1.  **Przygotowanie struktury plików**:
    *   Utworzenie `/src/pages/roadmaps/preview.astro`.
    *   Utworzenie katalogu `/src/components/roadmap/` na komponenty React: `RoadmapDisplay.tsx`, `RoadmapItemNode.tsx`, `InlineTextEdit.tsx`, `Spinner.tsx`.
    *   Utworzenie (jeśli nie istnieje) `/src/hooks/` i potencjalnie `useRoadmapManager.ts`.
2.  **Implementacja typów ViewModel**:
    *   Zdefiniowanie `RoadmapItemViewModel` i `RoadmapViewData` w odpowiednim pliku (np. `/src/types/viewModels.ts` lub w plikach komponentów).
    *   Implementacja funkcji transformującej `RoadmapDetailsDto` na `RoadmapViewData` (budowa drzewa z płaskiej listy `items`).
3.  **Implementacja komponentu `Spinner.tsx`**.
4.  **Implementacja komponentu `InlineTextEdit.tsx`**:
    *   Logika przełączania między trybem wyświetlania a edycji.
    *   Obsługa `onSave`, `onCancel`.
    *   Podstawowa walidacja (np. niepusty).
5.  **Implementacja hooka `useRoadmapManager` (lub logiki bezpośrednio w `RoadmapDisplay`)**:
    *   Inicjalizacja stanu `roadmapViewData` z transformowanych danych.
    *   Implementacja funkcji do aktualizacji tytułu, opisu, stanu rozwinięcia.
    *   Przygotowanie miejsca na logikę DND (aktualizacja `parent_item_id`, `position`, `level`).
6.  **Implementacja komponentu `RoadmapItemNode.tsx`**:
    *   Wyświetlanie tytułu i opisu (z użyciem `InlineTextEdit`).
    *   Logika rozwijania/zwijania dzieci (jeśli `item.children` nie jest puste).
    *   Rekursywne renderowanie dzieci `RoadmapItemNode`.
    *   Integracja z `useDraggable` i `useDroppable` z `dnd-kit`.
7.  **Implementacja komponentu `RoadmapDisplay.tsx`**:
    *   Użycie hooka `useRoadmapManager` do zarządzania stanem.
    *   Inicjalizacja `DndContext`.
    *   Implementacja funkcji `handleDragStart`, `handleDragOver`, `handleDragEnd` dla `dnd-kit` do obsługi zmiany kolejności i zagnieżdżania, z uwzględnieniem walidacji struktury.
    *   Renderowanie listy `rootItems` za pomocą `RoadmapItemNode`.
    *   Warunkowe wyświetlanie `Spinner` podczas inicjalizacji.
    *   (Opcjonalnie) Dodanie przycisku "Zapisz zmiany" i logiki jego obsługi (wywołania API).
8.  **Implementacja strony `RoadmapPreviewPage.astro`**:
    *   Definicja `Astro.props` do przyjęcia `roadmapData`.
    *   Osadzenie komponentu `<RoadmapDisplay client:load roadmapData={...} />`.
    *   Zapewnienie przekazania danych do komponentu React (np. przez serializację do atrybutu lub globalnego obiektu `window` przy `client:load`).
9.  **Styling**:
    *   Stylizacja wszystkich komponentów za pomocą Tailwind CSS, zgodnie z wytycznymi Shadcn/ui (jeśli używane są jego komponenty bazowe np. dla Accordion).
    *   Zapewnienie czytelności i wizualnego rozróżnienia poziomów zagnieżdżenia.
10. **Integracja API dla zapisu (jeśli w zakresie tego widoku)**:
    *   Implementacja funkcji serwisowych do komunikacji z endpointami `PATCH /api/roadmaps/{id}` i `PATCH /api/roadmaps/{id}/items/{itemId}`.
    *   Podpięcie tych funkcji do akcji zapisu w `RoadmapDisplay`.
11. **Testowanie**:
    *   Testowanie wyświetlania roadmapy z różną strukturą i danymi.
    *   Testowanie funkcjonalności inline editing (edycja, zapis, anulowanie, walidacja).
    *   Testowanie DND (zmiana kolejności w ramach tego samego rodzica, przenoszenie między rodzicami, ograniczenia głębokości).
    *   Testowanie rozwijania/zwijania.
    *   Testowanie obsługi błędów.
12. **Bezpieczeństwo**:
    *   Implementacja sanitizacji XSS dla wszystkich treści wprowadzanych przez użytkownika.

Ten plan zakłada, że dane `RoadmapDetailsDto` są dostępne dla strony `/roadmaps/preview`. Jeśli strona musi sama pobrać te dane (np. na podstawie ID z URL), kroki implementacji będą musiały uwzględnić logikę pobierania danych (np. w `RoadmapPreviewPage.astro` lub na starcie `RoadmapDisplay.tsx`).