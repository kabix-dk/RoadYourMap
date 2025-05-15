<conversation_summary>
<decisions>
1. Wszystkie elementy roadmapy (rozdziały, podrozdziały, kroki) będą przechowywane w jednej tabeli self-referential `roadmap_items`.  
2. Atrybuty formularza (doświadczenie, technologia, poziom znajomości, cele, dodatkowe informacje) przechowywane jako osobne kolumny.  
3. Technologia/język jako zwykłe pole tekstowe, bez osobnej tabeli słownikowej.  
4. Brak dodatkowych danych użytkownika poza tymi z Supabase Auth; nie będzie tabeli `profiles`.  
5. Limit 5 roadmap na użytkownika egzekwowany mechanizmem bazy danych (trigger/constraint).  
6. Gap-based ordering użyte do porządkowania pozycji elementów (domyślny skok 1000, rebalans gdy różnica < 1).  
7. Kolumny `is_completed` (boolean) oraz `completed_at` (timestamp) w tabeli `roadmap_items`.  
8. Brak mechanizmu draftów; zapisy manualne i automatyczne przy wylogowaniu.  
9. Postęp (procent ukończenia) będzie obliczany dynamicznie przy zapytaniu.  
10. Indeksy: `roadmaps(user_id)` oraz kompozytowy `roadmap_items(roadmap_id, parent_item_id, position)`.  
11. Brak partycjonowania na MVP.  
12. Twarde usuwanie (hard delete) dla wszystkich rekordów.  
13. Role: zwykły użytkownik i admin; RLS na `roadmaps` i `roadmap_items` z politykami ograniczającymi dostęp do `auth.uid() = user_id`, admin z pełnym dostępem.  
14. UUID jako typ kluczy głównych we wszystkich tabelach.  
15. Brak ograniczeń co do długości pól tekstowych – wszystkie tekstowe jako `TEXT`.  
16. `experience_level` jako pole tekstowe.  
17. Poziom (`level`) w `roadmap_items` wprowadzany ręcznie.  
18. Admin z możliwie największymi uprawnieniami.  
19. Brak audytu/historycznych zapisów zmian.  
20. Domyślna izolacja transakcji wystarczy.  
21. Kolumna `position` powinna być unikalna w obrębie `(roadmap_id, parent_item_id)`, wszystkie wymagane pola z `NOT NULL`.  
22. Brak planów eksportu/importu roadmap.  
23. Brak mechanizmów kontroli współbieżnych wersji.  
</decisions>

<matched_recommendations>
1. Użyć UUID jako kluczy głównych dla tabel `roadmaps` i `roadmap_items`.  
2. Zdefiniować tabelę `roadmaps` z kolumnami:  
   - `id UUID PRIMARY KEY`  
   - `user_id UUID REFERENCES auth.users(id)`  
   - `title TEXT NOT NULL`  
   - `experience_level TEXT NOT NULL`  
   - `technology TEXT NOT NULL`  
   - `goals TEXT NOT NULL`  
   - `additional_info TEXT`  
   - `created_at TIMESTAMPTZ DEFAULT NOW()`  
   - `updated_at TIMESTAMPTZ DEFAULT NOW()`  
3. Zdefiniować tabelę `roadmap_items` self-referential z kolumnami:  
   - `id UUID PRIMARY KEY`  
   - `roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE`  
   - `parent_item_id UUID REFERENCES roadmap_items(id) ON DELETE CASCADE`  
   - `title TEXT NOT NULL`  
   - `description TEXT`  
   - `level INT NOT NULL`  
   - `position INT NOT NULL`  
   - `is_completed BOOLEAN DEFAULT FALSE`  
   - `completed_at TIMESTAMPTZ`  
   - `created_at TIMESTAMPTZ DEFAULT NOW()`  
   - `updated_at TIMESTAMPTZ DEFAULT NOW()`  
4. Dodać indeksy:  
   - `CREATE INDEX ON roadmaps(user_id);`  
   - `CREATE INDEX ON roadmap_items(roadmap_id, parent_item_id, position);`  
5. Włączyć RLS z politykami:  
   - Dla autoryzowanych użytkowników `USING (auth.uid() = user_id)`  
   - Rola `admin` z pełnym dostępem (bypass RLS).  
6. Trigger/constraint do ograniczenia maks. 5 rekordów w `roadmaps` na `user_id`.  
7. Gap-based ordering: domyślny krok 1000 i procedura PL/pgSQL do rebalansowania pozycji, gdy różnica <1.  
8. Unikalny constraint na `(roadmap_id, parent_item_id, position)`.  
9. Timestampy `created_at`/`updated_at` dla śledzenia zmian.  
10. Unikać partycjonowania w MVP; skupić się na indeksach.  
</matched_recommendations>

<database_planning_summary>
MVP bazy danych PostgreSQL składa się z dwóch głównych tabel:  
• `roadmaps` – przechowuje metadane o roadmapach, wiązane z użytkownikiem przez `user_id`.  
• `roadmap_items` – hierarchiczna tabela self-referential dla rozdziałów, podrozdziałów i kroków, z polami `level`, `position`, `is_completed` i `completed_at`.  

Kluczowe relacje i ograniczenia:  
• Jeden użytkownik może mieć maksymalnie 5 roadmap (egzekwowane przez trigger/constraint).  
• Pozycje elementów porządkowane gap-based orderingiem (domyślny skok 1000, rebalans w PL/pgSQL).  
• Kaskadowe usuwanie elementów przy usunięciu roadmap lub rodzica elementu.  
• Unikalność `(roadmap_id, parent_item_id, position)` oraz `NOT NULL` dla kluczowych kolumn.  

Bezpieczeństwo i RLS:  
• RLS włączone na obu tabelach z politykami `auth.uid() = user_id` dla zwykłych użytkowników.  
• Rola `admin` z pełnym dostępem (bypass RLS).  

Wydajność i skalowalność:  
• Indeksy na `roadmaps(user_id)` i `roadmap_items(roadmap_id, parent_item_id, position)` dla szybkich zapytań hierarchicznych.  
• Dynamiczne obliczanie postępu bez materializowanych widoków.  
• Unikanie partycjonowania na początek; ewentualne dodanie przy wzroście wolumenów.  

Operacje i spójność:  
• Domyślna izolacja transakcji (READ COMMITTED) wystarcza dla jednego użytkownika edytującego swoje roadmapy.  
• Twarde usuwanie bez mechanizmów soft delete ani audytu.  
</database_planning_summary>

<unresolved_issues>
Brak nierozwiązanych kwestii – wszystkie kluczowe decyzje zostały podjęte.
</unresolved_issues>
</conversation_summary>
