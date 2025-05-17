# Architektura UI dla RoadYourMap

## 1. Przegląd struktury UI

Interfejs oparty na ciemnym motywie "Dracula", wykorzystujący Tailwind CSS i komponenty Shadcn/ui. Desktop-first, z prostą i przejrzystą nawigacją górną. Główne sekcje to: uwierzytelnianie, dashboard (lista roadmap), tworzenie roadmapy, podgląd i edycja roadmapy oraz profil użytkownika.

## 2. Lista widoków

- Nazwa widoku: Logowanie
  - Ścieżka: `/login`
  - Główny cel: uwierzytelnienie użytkownika
  - Kluczowe informacje: pola e-mail i hasło, link do rejestracji, komunikaty o błędach
  - Kluczowe komponenty: `AuthForm`, `Input`, `Button`, `InlineErrorMessage`, `Spinner`
  - UX: walidacja inline (React Hook Form + Zod), spinner przy submit, aria-live dla błędów
  - Bezpieczeństwo: zabezpieczenie HTTPS, obsługa błędnych danych

- Nazwa widoku: Rejestracja
  - Ścieżka: `/register`
  - Główny cel: rejestracja nowego użytkownika
  - Kluczowe informacje: pola e-mail, hasło, potwierdzenie hasła, komunikaty walidacji
  - Kluczowe komponenty: `AuthForm`, `Input`, `Button`, `InlineErrorMessage`, `Spinner`
  - UX: sprawdzanie siły hasła, walidacja haseł, spinner przy rejestracji
  - Bezpieczeństwo: unikalność e-maila, silne hasła

- Nazwa widoku: Dashboard (Lista Roadmap)
  - Ścieżka: `/dashboard`
  - Główny cel: przegląd i zarządzanie istniejącymi roadmapami
  - Kluczowe informacje: tytuł roadmapy, postęp procentowy, data utworzenia, akcje: podgląd, edycja, usunięcie
  - Kluczowe komponenty: `Card`, `Pagination`, `Button`, `ProgressBar`, `Dialog` (potwierdzenie usunięcia)
  - UX: paginacja 10 elementów na stronę, czytelne akcje, potwierdzenia usuwania
  - Bezpieczeństwo: ochrona tras (redirect do logowania)

- Nazwa widoku: Utwórz Roadmapę
  - Ścieżka: `/roadmaps/create`
  - Główny cel: zebranie danych do wygenerowania roadmapy przez AI
  - Kluczowe informacje: pola: tytuł, doświadczenie, technologia, cele, dodatkowe informacje
  - Kluczowe komponenty: `ReactHookForm`, `Input`, `Textarea`, `Button`, `InlineErrorMessage`, `Spinner`
  - UX: walidacja inline, spinner przy generowaniu, komunikat o limicie 5 roadmap
  - Bezpieczeństwo: wstępna walidacja po stronie klienta

- Nazwa widoku: Podgląd Wygenerowanej Roadmapy
  - Ścieżka: `/roadmaps/preview`
  - Główny cel: prezentacja struktury roadmapy wygenerowanej przez AI
  - Kluczowe informacje: drzewo 2–3 poziomy z tytułami i opisami
  - Kluczowe komponenty: `Accordion`/`Tree`, `Spinner`, `InlineEditing`, `DndContext` (drag-and-drop)
  - UX: rozwijane listy, inline editing, drag-and-drop
  - Bezpieczeństwo: sanitizacja treści, ochrona XSS

- Nazwa widoku: Szczegóły Roadmapy
  - Ścieżka: `/roadmaps/:id`
  - Główny cel: przegląd roadmapy i śledzenie postępów
  - Kluczowe informacje: pasek postępu, lista kroków z checkboxami, procent ukończenia
  - Kluczowe komponenty: `ProgressBar`, `Checkbox`, `List`, `Button`
  - UX: natychmiastowa aktualizacja postępu, aria-label dla checkboxów
  - Bezpieczeństwo: autoryzacja dostępu

- Nazwa widoku: Edycja Roadmapy
  - Ścieżka: `/roadmaps/:id/edit`
  - Główny cel: edycja i modyfikacja istniejącej roadmapy
  - Kluczowe informacje: drzewo 2–3 poziomy, narzędzia inline editing, pozycjonowanie elementów
  - Kluczowe komponenty: `Accordion`/`Tree`, `InlineEditing`, `DndContext`, `Dialog`, `Button`, `Spinner`
  - UX: drag-and-drop, potwierdzenia usuwania, ręczne zapisywanie zmian
  - Bezpieczeństwo: walidacja, kontrola praw dostępu

- Nazwa widoku: Profil Użytkownika
  - Ścieżka: `/profile`
  - Główny cel: wyświetlenie danych użytkownika i wylogowanie
  - Kluczowe informacje: nazwa użytkownika, e-mail, przycisk wylogowania
  - Kluczowe komponenty: `ProfileCard`, `Button`, `Dialog`
  - UX: dialog potwierdzający wylogowanie z zapisem zmian, spinner przy zapisie
  - Bezpieczeństwo: zapis niesaved edits przed wylogowaniem

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na `/login`. W przypadku braku konta może przejść do `/register`.
2. Po pomyślnym zalogowaniu redirect do `/dashboard`.
3. Z poziomu dashboard użytkownik może:
   a. Kliknąć "Utwórz Roadmapę" → `/roadmaps/create` → wypełnić formularz → wygenerować AI → przejść do `/roadmaps/preview`.
   b. Wybrać istniejącą roadmapę z listy → `/roadmaps/:id` (podgląd) → oznaczać ukończenie etapów lub przejść do edycji (`/roadmaps/:id/edit`).
4. W `/roadmaps/:id/edit` użytkownik edytuje drzewo roadmapy, korzysta z drag-and-drop i potwierdzeń usuwania → zapisuje zmiany.
5. Górny pasek nawigacji dostępny w każdej fazie: Dashboard, Utwórz Roadmapę, Profil, Wyloguj.
6. Przy wylogowaniu (wybór w menu Profil lub button Logout) wyświetlany dialog potwierdzenia i zapis niesaved edits, następnie wylogowanie.

## 4. Układ i struktura nawigacji

- Górny pasek nawigacyjny (`NavigationMenu` od Shadcn/ui) z linkami:
  - Dashboard (`/dashboard`)
  - Utwórz Roadmapę (`/roadmaps/create`)
  - Profil (`/profile`)
  - Wyloguj (Dialog potwierdzenia)
- Breadcrumbs wewnątrz widoków szczegółów roadmap dla orientacji
- Paginacja na dashboardzie z numerowanymi linkami i przyciskami "Poprzednia"/"Następna"
- Responsywne breakpoints Tailwind: `md`, `lg`, `xl`

## 5. Kluczowe komponenty

- **AuthForm** – komponent formularzy logowania i rejestracji (React Hook Form + Zod)
- **Accordion/Tree** – hierarchiczna prezentacja roadmapy (Shadcn/ui)
- **InlineEditing** – edycja tekstu w miejscu
- **DndContext** (dnd-kit) – drag-and-drop elementów roadmapy
- **Dialog** – potwierdzenia krytycznych akcji (usunięcie, wylogowanie)
- **ProgressBar** – wizualizacja postępu (Shadcn/ui)
- **Spinner** – stany ładowania (Shadcn/ui)
- **Pagination** – nawigacja po stronach listy roadmap
- **Toast/Banner** – globalne komunikaty i błędy sieciowe 