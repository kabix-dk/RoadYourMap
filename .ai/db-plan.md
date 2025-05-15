# Schemat bazy danych RoadYourMap

## 1. Tabele

### users

This table is managed by Supabase Auth.

### roadmaps
- id UUID PRIMARY KEY
- user_id UUID NOT NULL REFERENCES auth.users(id)
- title TEXT NOT NULL
- experience_level TEXT NOT NULL
- technology TEXT NOT NULL
- goals TEXT NOT NULL
- additional_info TEXT
- created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
- updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Constraints:**
- Unikalny klucz główny na `id`

### roadmap_items
- id UUID PRIMARY KEY
- roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE
- parent_item_id UUID REFERENCES roadmap_items(id) ON DELETE CASCADE
- title TEXT NOT NULL
- description TEXT
- level INT NOT NULL
- position INT NOT NULL
- is_completed BOOLEAN NOT NULL DEFAULT FALSE
- completed_at TIMESTAMPTZ
- created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
- updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Constraints:**
- UNIQUE (`roadmap_id`, `parent_item_id`, `position`)

## 2. Relacje

- `roadmaps` (1) — (⋆) `roadmap_items` (jeden-do-wielu)
- Hierarchia w `roadmap_items`: `parent_item_id` odnosi się do `roadmap_items.id` (self-referential)

## 3. Indeksy

```sql
CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_items_roadmap_parent_position ON roadmap_items(roadmap_id, parent_item_id, position);
```

## 4. Zasady PostgreSQL (RLS)

### roadmaps
```sql
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_roadmaps_access ON roadmaps
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### roadmap_items
```sql
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_items_access ON roadmap_items
  USING (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE id = roadmap_items.roadmap_id
        AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE id = roadmap_items.roadmap_id
        AND user_id = auth.uid()
    )
  );
```

**Admin role bypasses RLS by default (bypass RLS permission).**

## 5. Dodatkowe uwagi i decyzje projektowe

- **Limit 5 roadmap na użytkownika** realizowany przez trigger i funkcję PL/pgSQL:
  ```sql
  CREATE OR REPLACE FUNCTION enforce_max_roadmaps_per_user()
  RETURNS TRIGGER AS $$
  BEGIN
    IF (SELECT COUNT(*) FROM roadmaps WHERE user_id = NEW.user_id) > 5 THEN
      RAISE EXCEPTION 'User % may not have more than 5 roadmaps', NEW.user_id;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_max_roadmaps
    BEFORE INSERT OR UPDATE ON roadmaps
    FOR EACH ROW EXECUTE FUNCTION enforce_max_roadmaps_per_user();
  ```

- **Gap-based ordering**: domyślny skok `1000`. Opcjonalna procedura `rebalance_positions()` do ponownego ustawienia `position` gdy różnica < 1.
- **Hard delete**: brak mechanizmu soft delete ani audytu.
- Wszystkie tekstowe kolumny jako `TEXT`, wszystkie klucze jako `UUID`, timestampy jako `TIMESTAMPTZ`.