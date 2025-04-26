# Dokument wymagań produktu (PRD) – RoadYourMap

## 1. Przegląd produktu

RoadYourMap to aplikacja webowa, która umożliwia automatyczne generowanie spersonalizowanych roadmap nauki, szczególnie w kontekście nauki języków programowania i technologii IT. Kluczową wartością jest uproszczenie i uporządkowanie procesu zdobywania wiedzy poprzez dostosowanie planu nauki do indywidualnych potrzeb użytkownika. Produkt powstaje jako MVP (Minimum Viable Product) z priorytetem prostoty, przejrzystości i łatwości obsługi. Docelowa grupa użytkowników to osoby techniczne uczące się nowych technologii.

## 2. Problem użytkownika

Użytkownicy mają trudności z samodzielnym planowaniem nauki nowych technologii – brakuje im jasnej, dopasowanej do ich poziomu i celów roadmapy. Często nie wiedzą, od czego zacząć, jak rozłożyć naukę na etapy i jak monitorować postępy. Istniejące narzędzia są albo zbyt ogólne, albo przeładowane funkcjonalnościami, które nie wspierają efektywnej nauki. RoadYourMap rozwiązuje ten problem, oferując automatycznie generowaną, edytowalną roadmapę, która uwzględnia indywidualne preferencje i pozwala na śledzenie postępów.

## 3. Wymagania funkcjonalne

- Formularz wejściowy z polami: opis doświadczenia w IT, wybrana technologia/język, poziom znajomości, główne cele nauki, opcjonalne dodatkowe informacje.
- Walidacja pól formularza, w tym limity znaków (do doprecyzowania).
- Generowanie roadmapy przez AI na podstawie danych z formularza.
- Struktura roadmapy: 2–3 poziomy (rozdziały, podrozdziały, kroki).
- Prezentacja roadmapy jako rozwijanej, czytelnej listy.
- Edycja roadmapy na wszystkich poziomach: dodawanie, usuwanie, edycja, zmiana kolejności elementów (opcjonalnie).
- Oznaczanie ukończonych elementów roadmapy.
- Pasek postępu w widoku podsumowania roadmapy.
- Ręczny zapis zmian oraz automatyczny zapis przy wylogowaniu.
- System kont użytkowników oparty o Supabase (rejestracja, logowanie, brak integracji z zewnętrznymi usługami).
- Roadmapy dostępne tylko dla zalogowanych użytkowników.
- Limit: 5 roadmap na użytkownika.
- Podstawowe komunikaty o błędach na każdym etapie korzystania z aplikacji.

## 4. Granice produktu

Zakres MVP obejmuje wyłącznie:
- Automatyczne generowanie i edycję roadmap nauki w strukturze 2–3 poziomowej.
- Prosty system kont użytkowników.
- Przechowywanie i edycję roadmap wyłącznie online.
- Brak wsparcia dla urządzeń mobilnych.
- Brak eksportu, klonowania roadmap, onboardingu, personalizacji interfejsu, rozbudowanych powiadomień, zaawansowanego wizualnego edytora, kompleksowych profili użytkowników oraz testów użyteczności w MVP.
- Priorytet: prostota i przejrzystość interfejsu.

## 5. Historyjki użytkowników

US-001  
Tytuł: Rejestracja użytkownika  
Opis: Jako nowy użytkownik chcę się zarejestrować, aby uzyskać dostęp do aplikacji i móc tworzyć własne roadmapy.  
Kryteria akceptacji:
- Użytkownik może utworzyć konto za pomocą formularza rejestracyjnego.
- Po rejestracji użytkownik zostaje automatycznie zalogowany.
- Formularz waliduje poprawność danych (np. unikalność e-maila, wymagane pola).

US-002  
Tytuł: Logowanie użytkownika  
Opis: Jako zarejestrowany użytkownik chcę się zalogować, aby uzyskać dostęp do moich roadmap.  
Kryteria akceptacji:
- Użytkownik może zalogować się za pomocą e-maila i hasła.
- Błędne dane skutkują czytelnym komunikatem o błędzie.
- Po zalogowaniu użytkownik widzi swoje roadmapy.

US-003  
Tytuł: Wypełnienie formularza wejściowego  
Opis: Jako zalogowany użytkownik chcę wypełnić formularz dotyczący mojego doświadczenia, technologii i celów, aby wygenerować spersonalizowaną roadmapę.  
Kryteria akceptacji:
- Formularz zawiera wymagane pola: doświadczenie w IT, technologia/język, poziom znajomości, cele nauki, opcjonalne dodatkowe informacje.
- Pola są walidowane (np. limity znaków, wymagane pola).
- Po wysłaniu formularza użytkownik otrzymuje wygenerowaną roadmapę.

US-004  
Tytuł: Generowanie roadmapy przez AI  
Opis: Jako użytkownik chcę, aby na podstawie mojego formularza AI wygenerowało dla mnie roadmapę nauki.  
Kryteria akceptacji:
- Roadmapa jest generowana automatycznie po przesłaniu formularza.
- Struktura roadmapy obejmuje 2–3 poziomy (rozdziały, podrozdziały, kroki).
- Roadmapa jest prezentowana w czytelnej, rozwijanej liście.

US-005  
Tytuł: Przeglądanie roadmapy  
Opis: Jako użytkownik chcę przeglądać wygenerowaną roadmapę w przejrzystej strukturze.  
Kryteria akceptacji:
- Roadmapa wyświetla się jako rozwijana lista.
- Każdy poziom roadmapy jest czytelnie oznaczony.

US-006  
Tytuł: Edycja roadmapy  
Opis: Jako użytkownik chcę edytować roadmapę, aby dostosować ją do swoich potrzeb.  
Kryteria akceptacji:
- Użytkownik może dodawać, usuwać i edytować elementy na każdym poziomie roadmapy.
- Możliwa jest zmiana kolejności elementów (opcjonalnie).
- Zmiany są widoczne natychmiast w interfejsie.

US-007  
Tytuł: Oznaczanie ukończonych elementów  
Opis: Jako użytkownik chcę oznaczać etapy jako ukończone, aby śledzić swój postęp.  
Kryteria akceptacji:
- Użytkownik może oznaczyć dowolny element roadmapy jako ukończony.
- Pasek postępu aktualizuje się zgodnie z liczbą ukończonych elementów.

US-008  
Tytuł: Zapis zmian w roadmapie  
Opis: Jako użytkownik chcę móc zapisać zmiany manualnie oraz mieć pewność, że moje zmiany nie przepadną przy wylogowaniu.  
Kryteria akceptacji:
- Użytkownik może zapisać zmiany ręcznie.
- Roadmapa zapisuje się automatycznie przy wylogowaniu.

US-009  
Tytuł: Zarządzanie wieloma roadmapami  
Opis: Jako użytkownik chcę przechowywać do 5 roadmap, aby móc planować naukę różnych technologii.  
Kryteria akceptacji:
- Użytkownik może utworzyć maksymalnie 5 roadmap.
- Próba utworzenia kolejnej roadmapy powyżej limitu skutkuje czytelnym komunikatem o błędzie.

US-010  
Tytuł: Bezpieczny dostęp i autoryzacja  
Opis: Jako użytkownik chcę mieć pewność, że moje roadmapy są dostępne tylko po zalogowaniu, aby moje dane były bezpieczne.  
Kryteria akceptacji:
- Roadmapy są widoczne tylko dla zalogowanego użytkownika.
- Próba dostępu bez autoryzacji skutkuje przekierowaniem do logowania.

US-011  
Tytuł: Komunikaty o błędach  
Opis: Jako użytkownik chcę otrzymywać jasne komunikaty o błędach na każdym etapie korzystania z aplikacji, aby wiedzieć, co poszło nie tak.  
Kryteria akceptacji:
- Każdy błąd (np. walidacja formularza, limit roadmap, błąd zapisu) generuje czytelny komunikat.
- Komunikaty są zrozumiałe i nie zawierają technicznego żargonu.

US-012  
Tytuł: Wylogowanie  
Opis: Jako użytkownik chcę móc się wylogować z aplikacji, aby zakończyć sesję.  
Kryteria akceptacji:
- Użytkownik może wylogować się w dowolnym momencie.
- Przy wylogowaniu roadmapy są automatycznie zapisywane.

US-013  
Tytuł: Rozbudowa istniejącej roadmapy  
Opis: Jako użytkownik chcę móc rozbudowywać istniejącą roadmapę o nowe elementy, aby aktualizować swój plan nauki.  
Kryteria akceptacji:
- Użytkownik może dodać nowe rozdziały, podrozdziały lub kroki do istniejącej roadmapy.
- Nowe elementy są natychmiast widoczne w interfejsie.

## 6. Metryki sukcesu

- Minimum 70% elementów z wygenerowanej przez AI roadmapy zostaje zapisanych przez użytkownika.
- Liczba wygenerowanych roadmap na użytkownika oraz liczba edytowanych roadmap.
- Poziom zaangażowania: liczba oznaczonych jako ukończone elementów w roadmapach.