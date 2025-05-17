# Plan implementacji widoku Utwórz Roadmapę

## 1. Przegląd
Widok "Utwórz Roadmapę" umożliwia zalogowanym użytkownikom wprowadzenie danych niezbędnych do wygenerowania spersonalizowanej roadmapy nauki przez mechanizm AI. Użytkownik wypełnia formularz określający m.in. tytuł roadmapy, swój poziom doświadczenia, wybraną technologię oraz cele nauki. Po pomyślnym przesłaniu formularza, system generuje roadmapę i przekierowuje użytkownika do jej podglądu.

## 2. Routing widoku
Widok będzie dostępny pod następującą ścieżką:
- `/roadmaps/create`

Strona ta powinna być chroniona i dostępna tylko dla zalogowanych użytkowników. Niezalogowani użytkownicy próbujący uzyskać dostęp powinni być przekierowywani na stronę logowania (`/login`).

## 3. Struktura komponentów
Struktura komponentów dla widoku `/roadmaps/create` będzie następująca:

```
src/pages/roadmaps/create.astro (Layout strony Astro)
└── src/components/RoadmapCreationForm.tsx (Komponent Reactowy, client:load)
    ├── Shadcn/ui Label + Input (Tytuł Roadmapy)
    │   └── InlineErrorMessage (Walidacja pola Tytuł)
    ├── Shadcn/ui Label + Input (Poziom Doświadczenia)
    │   └── InlineErrorMessage (Walidacja pola Poziom Doświadczenia)
    ├── Shadcn/ui Label + Input (Technologia)
    │   └── InlineErrorMessage (Walidacja pola Technologia)
    ├── Shadcn/ui Label + Textarea (Cele Nauki)
    │   └── InlineErrorMessage (Walidacja pola Cele)
    ├── Shadcn/ui Label + Textarea (Dodatkowe Informacje)
    │   └── InlineErrorMessage (Walidacja pola Dodatkowe Informacje - jeśli dotyczy)
    ├── Shadcn/ui Button ("Generuj Roadmapę")
    │   └── Shadcn/ui Spinner (wyświetlany warunkowo podczas ładowania)
    └── InlineErrorMessage (Dla ogólnych błędów API, np. limit roadmap)
```

## 4. Szczegóły komponentów

### `src/pages/roadmaps/create.astro`
- **Opis komponentu:** Główny plik strony Astro dla ścieżki `/roadmaps/create`. Odpowiada za ogólny layout strony, w tym nagłówek, stopkę oraz osadzenie interaktywnego formularza Reactowego. Zapewnia ochronę trasy (tylko dla zalogowanych).
- **Główne elementy:** Standardowa struktura layoutu Astro, `<RoadmapCreationForm client:load />` do osadzenia komponentu React.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji, deleguje je do `RoadmapCreationForm`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Standardowe typy Astro.
- **Propsy:** Brak.

### `src/components/RoadmapCreationForm.tsx`
- **Opis komponentu:** Interaktywny formularz Reactowy służący do zbierania danych potrzebnych do utworzenia nowej roadmapy. Wykorzystuje `ReactHookForm` do zarządzania stanem formularza i walidacji za pomocą Zod. Komunikuje się z API w celu wysłania danych i obsługuje stany ładowania oraz błędy.
- **Główne elementy HTML i komponenty dzieci:**
    - Formularz (`<form>`).
    - Komponenty `Input` i `Textarea` z biblioteki Shadcn/ui dla pól: Tytuł, Poziom doświadczenia, Technologia, Cele, Dodatkowe informacje. Każde pole będzie poprzedzone komponentem `Label` z Shadcn/ui.
    - Komponent `Button` z Shadcn/ui do wysyłania formularza.
    - Komponent `Spinner` z Shadcn/ui wyświetlany podczas wysyłania danych.
    - Komponenty `InlineErrorMessage` (własny lub prosty element `p`) do wyświetlania błędów walidacji pod każdym polem oraz ogólnego błędu API.
- **Obsługiwane interakcje:**
    - Wprowadzanie danych w pola formularza.
    - Utrata fokusu z pola (uruchomienie walidacji dla danego pola).
    - Kliknięcie przycisku "Generuj Roadmapę" (uruchomienie walidacji całego formularza i wysłanie danych do API).
- **Obsługiwana walidacja (zgodna z Zod schema i API):**
    - `title`: Wymagane, string, min. 1 znak, maks. 255 znaków.
    - `experience_level`: Wymagane, string, min. 1 znak, maks. 50 znaków.
    - `technology`: Wymagane, string, min. 1 znak, maks. 100 znaków.
    - `goals`: Wymagane, string, min. 1 znak.
    - `additional_info`: Opcjonalne, string.
- **Typy:**
    - `CreateRoadmapFormData` (typ danych formularza, generowany z Zod schema).
    - `CreateRoadmapCommand` (typ danych wysyłanych do API, z `src/types.ts`).
    - `RoadmapDetailsDto` (typ danych odbieranych z API, z `src/types.ts`).
- **Propsy:** Komponent nie przyjmuje propsów od rodzica, zarządza swoim stanem wewnętrznie.

### `InlineErrorMessage.tsx` (jeśli jest to dedykowany komponent)
- **Opis komponentu:** Prosty komponent do wyświetlania komunikatów o błędach walidacji lub innych powiadomień.
- **Główne elementy:** Element `<p>` lub `<span>` z odpowiednimi stylami Tailwind CSS.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `message: string | undefined`.
- **Propsy:** `message: string | undefined`.

## 5. Typy
Kluczowe typy danych wykorzystywane w widoku:

1.  **`CreateRoadmapFormData`** (Typ danych formularza w komponencie Reactowym):
    ```typescript
    import { z } from 'zod';

    export const createRoadmapFormSchema = z.object({
      title: z.string().min(1, "Tytuł jest wymagany.").max(255, "Tytuł może mieć maksymalnie 255 znaków."),
      experience_level: z.string().min(1, "Poziom doświadczenia jest wymagany.").max(50, "Poziom doświadczenia może mieć maksymalnie 50 znaków."),
      technology: z.string().min(1, "Technologia jest wymagana.").max(100, "Technologia może mieć maksymalnie 100 znaków."),
      goals: z.string().min(1, "Cele są wymagane."),
      additional_info: z.string().optional(),
    });

    export type CreateRoadmapFormData = z.infer<typeof createRoadmapFormSchema>;
    ```

2.  **`CreateRoadmapCommand`** (Typ danych dla żądania API, zdefiniowany w `src/types.ts`):
    ```typescript
    export type CreateRoadmapCommand = Pick<
      TablesInsert<"roadmaps">,
      "title" | "experience_level" | "technology" | "goals" | "additional_info"
    >;
    // Pola:
    // title: string
    // experience_level: string
    // technology: string
    // goals: string
    // additional_info?: string | null
    ```

3.  **`RoadmapDetailsDto`** (Typ danych dla odpowiedzi API, zdefiniowany w `src/types.ts`):
    ```typescript
    export interface RoadmapDetailsDto extends Omit<Tables<"roadmaps">, "user_id"> {
      items: RoadmapItemDto[];
    }
    // Główne pola:
    // id: string (uuid)
    // title: string
    // experience_level: string
    // technology: string
    // goals: string
    // additional_info?: string | null
    // created_at: string (timestamp)
    // updated_at: string (timestamp)
    // items: RoadmapItemDto[]
    ```

## 6. Zarządzanie stanem
Zarządzanie stanem w komponencie `RoadmapCreationForm.tsx` będzie realizowane przy użyciu:
- **`ReactHookForm` (`useForm` hook):** Do zarządzania wartościami pól formularza, stanami walidacji (błędy, `isDirty`, `isValid`), stanem wysyłania (`isSubmitting`). Resolver Zod (`@hookform/resolvers/zod`) będzie użyty do integracji ze schematem walidacji `createRoadmapFormSchema`.
- **Lokalny stan React (`useState`):**
    - `apiError: string | null`: Do przechowywania ogólnych błędów zwróconych przez API (np. błąd limitu roadmap, błąd serwera).
    - `isLoading: boolean`: Można użyć `formState.isSubmitting` z `ReactHookForm` lub dedykowanego stanu, jeśli potrzebna jest dodatkowa kontrola nad wskaźnikiem ładowania niezależnie od samego procesu wysyłania formularza. `formState.isSubmitting` jest preferowane.

Nie przewiduje się potrzeby tworzenia dedykowanego, złożonego hooka dla tego widoku. Konieczne będzie uzyskanie tokenu JWT użytkownika, co prawdopodobnie będzie obsługiwane przez globalny kontekst/hook autoryzacji (np. `useAuth`).

## 7. Integracja API
Integracja z API będzie polegać na wysłaniu żądania `POST` do endpointu `/api/roadmaps/generate`.

- **Endpoint:** `POST /api/roadmaps/generate`
- **Metoda HTTP:** `POST`
- **Nagłówki:**
    - `Content-Type: application/json`
    - `Authorization: Bearer <TOKEN_JWT_UZYTKOWNIKA>` (Token musi być pobrany z systemu autoryzacji, np. Supabase).
- **Ciało żądania (Request Body):** Obiekt typu `CreateRoadmapCommand`, zawierający dane z formularza.
    ```json
    {
      "title": "string",
      "experience_level": "string",
      "technology": "string",
      "goals": "string",
      "additional_info": "string" // opcjonalne
    }
    ```
- **Odpowiedź (Success - 201 Created):** Obiekt typu `RoadmapDetailsDto`.
    ```json
    {
      "roadmap": { // Klucz "roadmap" jest obecny w implementacji endpointu
        "id": "uuid",
        "title": "string",
        "experience_level": "string",
        // ... reszta pól RoadmapDetailsDto
        "items": [ /* tablica RoadmapItemDto */ ]
      }
    }
    ```
- **Obsługa odpowiedzi:**
    - **Sukces (201):** Przetworzenie odpowiedzi, pobranie `RoadmapDetailsDto`. Przekierowanie użytkownika na stronę podglądu nowo utworzonej roadmapy (np. `/roadmaps/preview` lub `/roadmaps/:id`). Stan ładowania jest wyłączany.
    - **Błąd (np. 400, 401, 500):** Wyświetlenie odpowiedniego komunikatu o błędzie użytkownikowi. Stan ładowania jest wyłączany.

## 8. Interakcje użytkownika
- **Wprowadzanie danych:** Użytkownik wpisuje tekst w pola `Input` i `Textarea`. `ReactHookForm` aktualizuje stan formularza.
- **Walidacja w czasie rzeczywistym/przy utracie fokusu:** Po opuszczeniu pola, walidacja Zod jest uruchamiana dla tego pola, a ewentualny błąd jest wyświetlany za pomocą `InlineErrorMessage`.
- **Wysyłanie formularza:**
    - Użytkownik klika przycisk "Generuj Roadmapę".
    - `ReactHookForm` uruchamia pełną walidację formularza.
    - **Jeśli walidacja nie powiodła się:** Wyświetlane są błędy przy odpowiednich polach. Wysyłka jest blokowana.
    - **Jeśli walidacja powiodła się:**
        - Przycisk "Generuj Roadmapę" może zostać zablokowany, a obok/wewnątrz niego pojawia się `Spinner`.
        - Wykonywane jest żądanie API `POST /api/roadmaps/generate`.
- **Po odpowiedzi API:**
    - **Sukces:** `Spinner` znika, użytkownik jest przekierowywany na stronę podglądu roadmapy.
    - **Błąd:** `Spinner` znika, wyświetlany jest ogólny komunikat błędu (np. "Osiągnięto limit 5 roadmap", "Błąd serwera"). Formularz pozostaje edytowalny.

## 9. Warunki i walidacja
Warunki walidacji są definiowane przez schemat Zod `createRoadmapFormSchema` i odzwierciedlają wymagania API:
- **`title`**:
    - Wymagane: Tak
    - Typ: String
    - Min. długość: 1
    - Maks. długość: 255
    - Komunikat błędu (PL): "Tytuł jest wymagany.", "Tytuł może mieć maksymalnie 255 znaków."
- **`experience_level`**:
    - Wymagane: Tak
    - Typ: String
    - Min. długość: 1
    - Maks. długość: 50
    - Komunikat błędu (PL): "Poziom doświadczenia jest wymagany.", "Poziom doświadczenia może mieć maksymalnie 50 znaków."
- **`technology`**:
    - Wymagane: Tak
    - Typ: String
    - Min. długość: 1
    - Maks. długość: 100
    - Komunikat błędu (PL): "Technologia jest wymagana.", "Technologia może mieć maksymalnie 100 znaków."
- **`goals`**:
    - Wymagane: Tak
    - Typ: String
    - Min. długość: 1
    - Komunikat błędu (PL): "Cele są wymagane."
- **`additional_info`**:
    - Wymagane: Nie
    - Typ: String

Walidacja jest wykonywana po stronie klienta przed wysłaniem żądania API. Stan interfejsu (np. wyświetlanie błędów, blokowanie przycisku) jest aktualizowany na podstawie wyników walidacji.

## 10. Obsługa błędów
- **Błędy walidacji pól (klient):** Obsługiwane przez `ReactHookForm` i Zod. Komunikaty wyświetlane przy użyciu `InlineErrorMessage` pod każdym niepoprawnym polem.
- **Błąd przekroczenia limitu roadmap (API 400):**
    - Wykrywany na podstawie odpowiedzi API.
    - Komunikat dla użytkownika: "Osiągnięto limit 5 roadmap. Nie można utworzyć nowej." (wyświetlany w ogólnym miejscu na błędy API).
- **Inne błędy żądania (API 400 - np. nieprzewidziany błąd walidacji po stronie serwera):**
    - Komunikat dla użytkownika: "Wystąpił błąd podczas przetwarzania danych. Sprawdź poprawność wprowadzonych informacji."
- **Błąd autoryzacji (API 401):**
    - Użytkownik powinien zostać automatycznie przekierowany na stronę logowania (`/login`). Obsługa globalna.
- **Błędy serwera (API 5xx):**
    - Komunikat dla użytkownika: "Wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie później."
- **Błędy sieciowe (brak połączenia):**
    - Komunikat dla użytkownika: "Brak połączenia z internetem. Sprawdź swoje połączenie i spróbuj ponownie."
- **Stan ładowania:** Komponent `Spinner` jest wyświetlany podczas trwania żądania API i ukrywany po jego zakończeniu (niezależnie od sukcesu czy błędu). Przycisk wysyłki powinien być nieaktywny podczas ładowania.

## 11. Kroki implementacji
1.  **Utworzenie pliku strony Astro:** Stworzyć plik `src/pages/roadmaps/create.astro`.
    - Dodać podstawowy layout strony.
    - Zaimplementować logikę ochrony trasy (przekierowanie do `/login` dla niezalogowanych użytkowników).
2.  **Utworzenie komponentu React `RoadmapCreationForm`:** Stworzyć plik `src/components/RoadmapCreationForm.tsx`.
    - Osadzić komponent `RoadmapCreationForm` w `create.astro` z dyrektywą `client:load`.
3.  **Zdefiniowanie schematu Zod i typów:** W `RoadmapCreationForm.tsx` (lub osobnym pliku, jeśli współdzielony) zdefiniować `createRoadmapFormSchema` oraz typ `CreateRoadmapFormData`.
4.  **Implementacja formularza:**
    - Użyć hooka `useForm` z `ReactHookForm` i resolvera Zod.
    - Dodać pola formularza (`Input`, `Textarea` z Shadcn/ui) wraz z `Label`.
    - Podpiąć pola do `ReactHookForm` za pomocą `register`.
    - Dodać wyświetlanie błędów walidacji (`formState.errors`) dla każdego pola używając `InlineErrorMessage`.
5.  **Implementacja logiki wysyłania:**
    - Dodać funkcję `onSubmit` przekazywaną do `handleSubmit` z `ReactHookForm`.
    - W funkcji `onSubmit` ustawić stan ładowania (`formState.isSubmitting` będzie true).
    - Zaimplementować pobieranie tokenu JWT (z kontekstu auth).
    - Wykonać żądanie `fetch` lub za pomocą dedykowanej funkcji do API (`POST /api/roadmaps/generate`) z danymi formularza i tokenem.
6.  **Obsługa odpowiedzi API:**
    - W przypadku sukcesu (status 201), pobrać dane roadmapy i przekierować użytkownika (np. `Astro.redirect('/roadmaps/preview')` lub na stronę szczegółów roadmapy).
    - W przypadku błędu, zaktualizować stan `apiError` odpowiednim komunikatem.
    - Zawsze resetować stan ładowania po zakończeniu żądania.
7.  **Dodanie komponentu `Spinner`:** Zintegrować `Spinner` z Shadcn/ui, aby był widoczny podczas `formState.isSubmitting`.
8.  **Styling:** Upewnić się, że wszystkie komponenty są poprawnie ostylowane przy użyciu Tailwind CSS i zgodnie z motywem Dracula / Shadcn/ui.
9.  **Testowanie:**
    - Przetestować walidację formularza (przypadki poprawne i błędne).
    - Przetestować wysyłanie formularza i różne odpowiedzi API (sukces, błąd limitu, błąd serwera).
    - Sprawdzić poprawność przekierowania po pomyślnym utworzeniu roadmapy.
    - Sprawdzić działanie ochrony trasy.
10. **Refaktoryzacja i czyszczenie kodu:** Przejrzeć kod pod kątem czytelności, wydajności i zgodności z wytycznymi projektu. 