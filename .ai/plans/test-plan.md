# Plan Testów dla Aplikacji RoadYourMap

## 1. Wprowadzenie i cele testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje strategię, zakres, zasoby i harmonogram testów dla aplikacji **RoadYourMap**. Celem projektu jest dostarczenie użytkownikom narzędzia do generowania spersonalizowanych roadmap rozwoju zawodowego i nauki z wykorzystaniem sztucznej inteligencji. Plan ten ma na celu zapewnienie, że finalny produkt będzie stabilny, bezpieczny, wydajny i zgodny z wymaganiami funkcjonalnymi.

### 1.2. Cele testowania

Główne cele procesu testowego to:
- **Zapewnienie jakości:** Weryfikacja, czy aplikacja spełnia najwyższe standardy jakości przed udostępnieniem jej użytkownikom.
- **Wykrywanie defektów:** Identyfikacja, analiza i raportowanie błędów na jak najwcześniejszym etapie cyklu rozwoju oprogramowania.
- **Weryfikacja funkcjonalności:** Potwierdzenie, że wszystkie funkcje, w tym kluczowy mechanizm generowania map AI, działają zgodnie ze specyfikacją.
- **Ocena wydajności i bezpieczeństwa:** Zapewnienie, że aplikacja jest responsywna, skalowalna i chroni dane użytkowników.
- **Walidacja UX/UI:** Sprawdzenie, czy interfejs użytkownika jest intuicyjny, spójny i responsywny na różnych urządzeniach.

## 2. Zakres testów

### 2.1. Funkcjonalności objęte testami

- **Moduł uwierzytelniania:** Rejestracja, logowanie, wylogowywanie, resetowanie hasła.
- **Panel użytkownika (Dashboard):** Wyświetlanie istniejących roadmap, zarządzanie nimi.
- **Generator roadmap AI:**
    - Formularz wejściowy (wprowadzanie celów, preferencji).
    - Proces komunikacji z API Openrouter.ai.
    - Parsowanie i wyświetlanie wygenerowanej mapy.
- **Zarządzanie kontem:** Edycja profilu, ustawienia.
- **Strony statyczne:** Strona główna, O nas, Kontakt, FAQ.

### 2.2. Funkcjonalności wyłączone z testów

- Testy wewnętrznej infrastruktury Supabase oraz Openrouter.ai (traktujemy je jako stabilne usługi zewnętrzne).
- Testy penetracyjne (mogą zostać zlecone zewnętrznej firmie w późniejszym etapie).
- Testy wydajności pod ekstremalnym obciążeniem (np. testy DoS), które wykraczają poza standardowe przypadki użycia.

## 3. Typy testów do przeprowadzenia

Ze względu na specyfikę stosu technologicznego (Astro + React, Supabase) zastosowane zostaną następujące rodzaje testów:

- **Testy jednostkowe (Unit Tests):**
  - **Cel:** Weryfikacja pojedynczych komponentów React, funkcji pomocniczych w `src/lib` oraz logiki interakcji z bazą danych w `src/db`.
  - **Narzędzia:** Vitest, React Testing Library.
  - **Zakres:** Izolowane testy logiki biznesowej, renderowania komponentów i obsługi zdarzeń. Będziemy mockować zależności zewnętrzne (np. Supabase SDK, API Openrouter).

- **Testy integracyjne (Integration Tests):**
  - **Cel:** Sprawdzenie współpracy pomiędzy różnymi częściami systemu.
  - **Zakres:**
    - Integracja komponentów React (np. formularz i lista danych).
    - Integracja frontendu z API (`src/pages/api`).
    - Integracja API z bazą danych Supabase (na dedykowanej, testowej instancji bazy danych).
  - **Narzędzia:** Vitest, React Testing Library, Mock Service Worker (MSW) do symulacji API.

- **Testy End-to-End (E2E):**
  - **Cel:** Symulacja rzeczywistych scenariuszy użytkownika w przeglądarce w celu weryfikacji przepływów w całej aplikacji.
  - **Narzędzia:** Playwright.
  - **Zakres:** Pełne ścieżki użytkownika, takie jak rejestracja -> stworzenie mapy -> wylogowanie.

- **Testy wizualnej regresji (Visual Regression Testing):**
  - **Cel:** Automatyczne wykrywanie niezamierzonych zmian w UI poprzez porównywanie zrzutów ekranu.
  - **Narzędzia:** Zintegrowane funkcje Playwright lub dedykowane narzędzia (np. Percy).
  - **Zakres:** Kluczowe widoki i komponenty UI, weryfikacja responsywności na różnych szerokościach ekranu.

- **Testy bezpieczeństwa (Security Testing):**
  - **Cel:** Identyfikacja podstawowych podatności.
  - **Zakres:**
    - Weryfikacja reguł dostępu (Row Level Security) w Supabase.
    - Sprawdzanie ochrony endpointów API (autoryzacja).
    - Podstawowe testy pod kątem XSS i CSRF.

- **Testy manualne i eksploracyjne:**
  - **Cel:** Ocena ogólnego doświadczenia użytkownika (UX), znalezienie błędów trudnych do zautomatyzowania.
  - **Zakres:** Spójność interfejsu, intuicyjność nawigacji, ogólne "odczucia" z korzystania z aplikacji.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

| ID | Funkcjonalność | Scenariusz | Priorytet |
|---|---|---|---|
| **AUTH-01** | Uwierzytelnianie | Pomyślna rejestracja nowego użytkownika z poprawnymi danymi. | Krytyczny |
| **AUTH-02** | Uwierzytelnianie | Próba rejestracji z już istniejącym adresem e-mail. | Wysoki |
| **AUTH-03** | Uwierzytelnianie | Pomyślne logowanie i przekierowanie do panelu użytkownika. | Krytyczny |
| **AUTH-04** | Uwierzytelnianie | Próba zalogowania z niepoprawnym hasłem. | Wysoki |
| **AUTH-05** | Uwierzytelnianie | Użytkownik może się bezpiecznie wylogować. | Wysoki |
| **MAP-01** | Generator AI | Użytkownik (zalogowany) może wypełnić i wysłać formularz generowania mapy. | Krytyczny |
| **MAP-02** | Generator AI | Aplikacja poprawnie wyświetla wygenerowaną mapę drogową po otrzymaniu odpowiedzi z API. | Krytyczny |
| **MAP-03** | Generator AI | Aplikacja obsługuje błędy ze strony API (np. timeout, błąd 500) i informuje o tym użytkownika. | Wysoki |
| **MAP-04**| Panel użytkownika | Zalogowany użytkownik widzi listę swoich roadmap na dashboardzie. | Wysoki |
| **MAP-05** | Panel użytkownika | Użytkownik może usunąć wybraną mapę drogową. | Średni |
| **API-01** | Bezpieczeństwo API | Niezalogowany użytkownik nie może uzyskać dostępu do chronionych endpointów API. | Krytyczny |
| **UI-01**| Responsywność | Aplikacja jest w pełni używalna na urządzeniach mobilnych (viewport < 480px). | Wysoki |

## 5. Środowisko testowe

- **Baza danych:** Oddzielna, dedykowana instancja projektu Supabase przeznaczona do celów testowych i deweloperskich (staging). Baza ta będzie regularnie czyszczona i wypełniana danymi testowymi.
- **Frontend/Backend:** Aplikacja uruchamiana lokalnie w trybie deweloperskim oraz na dedykowanym środowisku stagingowym (np. `staging.roadyourmap.com`) zintegrowanym z gałęzią `develop` w repozytorium.
- **Przeglądarki:** Testy E2E będą uruchamiane na najnowszych wersjach przeglądarek: Chrome, Firefox, Safari (przez emulator w Playwright).

## 6. Narzędzia do testowania

| Narzędzie | Zastosowanie |
|---|---|
| **Vitest** | Framework do testów jednostkowych i integracyjnych. |
| **React Testing Library** | Biblioteka do testowania komponentów React. |
| **Playwright** | Framework do testów End-to-End i wizualnej regresji. |
| **Mock Service Worker (MSW)** | Mockowanie zapytań sieciowych (API, Supabase SDK). |
| **TypeScript** | Zapewnienie poprawności typów i wsparcie dla mockowania danych. |
| **GitHub Actions** | Automatyzacja uruchamiania testów w procesie CI/CD. |
| **Jira / GitHub Issues** | Narzędzie do śledzenia i raportowania błędów. |

## 7. Harmonogram testów

Testy będą integralną częścią cyklu deweloperskiego i będą przebiegać w sposób ciągły.
- **Testy jednostkowe i integracyjne:** Pisane równolegle z nowymi funkcjami przez deweloperów. Muszą być w 100% "zielone" przed mergem do głównej gałęzi.
- **Testy E2E:** Rozwijane w trakcie sprintu i uruchamiane automatycznie w pipeline CI/CD dla każdego Pull Requesta.
- **Testy manualne/eksploracyjne:** Przeprowadzane na środowisku stagingowym przed każdym wdrożeniem produkcyjnym.
- **Testy regresji:** Uruchamiane automatycznie (E2E, wizualne) przed każdym wydaniem.

## 8. Kryteria akceptacji testów

### 8.1. Kryteria wejścia (rozpoczęcia testów)
- Kod źródłowy został zintegrowany i wdrożony na środowisku testowym.
- Wszystkie testy jednostkowe i integracyjne przechodzą pomyślnie.
- Dokumentacja techniczna dla nowych funkcji jest dostępna.

### 8.2. Kryteria wyjścia (zakończenia testów i akceptacji wydania)
- Wszystkie zaplanowane scenariusze testowe zostały wykonane.
- 100% testów automatycznych (jednostkowych, integracyjnych, E2E) przechodzi pomyślnie.
- Nie istnieją żadne otwarte błędy o priorytecie krytycznym (Blocker, Critical).
- Liczba otwartych błędów o priorytecie wysokim (Major) jest zgodna z ustaleniami zespołu.
- Aplikacja została pomyślnie wdrożona i zweryfikowana (smoke tests) na środowisku produkcyjnym.

## 9. Role i odpowiedzialności

| Rola | Odpowiedzialność |
|---|---|
| **Deweloperzy** | - Pisanie testów jednostkowych i integracyjnych dla tworzonego kodu.<br>- Naprawa błędów zgłoszonych przez zespół QA.<br>- Utrzymanie i konfiguracja środowisk testowych. |
| **Inżynier QA** | - Projektowanie, tworzenie i utrzymanie testów E2E.<br>- Wykonywanie testów manualnych i eksploracyjnych.<br>- Raportowanie, priorytetyzacja i weryfikacja błędów.<br>- Zarządzanie planem testów i strategią testową. |
| **Product Owner** | - Definiowanie kryteriów akceptacji dla funkcjonalności.<br>- Udział w testach akceptacyjnych użytkownika (UAT).<br>- Ostateczna decyzja o wdrożeniu na produkcję. |

## 10. Procedury raportowania błędów

Wszystkie zidentyfikowane błędy będą raportowane w systemie śledzenia (np. GitHub Issues) i powinny zawierać następujące informacje:
- **Tytuł:** Krótki, zwięzły opis problemu.
- **Środowisko:** Gdzie wystąpił błąd (np. Lokalnie, Staging, Produkcja; przeglądarka, system operacyjny).
- **Kroki do odtworzenia:** Szczegółowa, numerowana lista kroków potrzebnych do wywołania błędu.
- **Obserwowany rezultat:** Co się stało po wykonaniu kroków.
- **Oczekiwany rezultat:** Co powinno się stać.
- **Priorytet:** Krytyczność błędu (np. Blocker, Critical, Major, Minor, Trivial).
- **Załączniki:** Zrzuty ekranu, nagrania wideo, logi z konsoli.

Każdy błąd będzie przechodził przez cykl życia: `New` -> `In Progress` -> `Ready for QA` -> `Closed` / `Reopened`. 