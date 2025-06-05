# API Endpoint Implementation Plan: Update Roadmap Item

## 1. Przegląd punktu końcowego

Endpoint służy do aktualizacji istniejącego elementu roadmapy. Pozwala na częściową modyfikację właściwości elementu, w tym edycję tekstu, zmianę pozycji/poziomu oraz przełączanie statusu ukończenia. Zawiera specjalną logikę biznesową dla zarządzania timestampem ukończenia zadania.

## 2. Szczegóły żądania

- **Metoda HTTP**: PATCH
- **Struktura URL**: `/api/roadmaps/:roadmapId/items/:itemId`
- **Parametry**:
  - **Wymagane**:
    - `roadmapId` (path param) - UUID identyfikujący roadmapę
    - `itemId` (path param) - UUID identyfikujący element do aktualizacji
    - `Authorization` header - Bearer token
  - **Opcjonalne** (min. 1 pole wymagane w request body):
    - `title` - string (tytuł elementu)
    - `description` - string (opis elementu)
    - `level` - number (poziom hierarchii)
    - `position` - number (pozycja w sekwencji)
    - `is_completed` - boolean (status ukończenia)

- **Request Body**:
```json
{
  "title": "string",
  "description": "string", 
  "level": number,
  "position": number,
  "is_completed": boolean
}
```

## 3. Wykorzystywane typy

```typescript
// Istniejące typy z src/types.ts
UpdateRoadmapItemCommand // Command model dla request body
RoadmapItemRecordDto     // Response DTO
```

**Dodatkowe typy walidacyjne**:
```typescript
// Zod schemas dla walidacji
const UpdateRoadmapItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  level: z.number().int().min(0).optional(),
  position: z.number().int().min(0).optional(),
  is_completed: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided"
});

const UuidSchema = z.string().uuid();
```

## 4. Szczegóły odpowiedzi

- **200 OK**: Zwraca zaktualizowany element
```json
{
  "id": "uuid",
  "roadmap_id": "uuid", 
  "parent_item_id": "uuid|null",
  "title": "string",
  "description": "string",
  "level": number,
  "position": number,
  "is_completed": boolean,
  "completed_at": "timestamp|null",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

- **Kody błędów**:
  - `400 Bad Request`: Walidacja nie przeszła
  - `401 Unauthorized`: Brak/nieprawidłowy token
  - `404 Not Found`: Element lub roadmapa nie istnieje/brak dostępu
  - `500 Internal Server Error`: Błąd serwera

## 5. Przepływ danych

1. **Walidacja wejściowa**:
   - Sprawdzenie formatu UUID dla path params
   - Walidacja request body (min. 1 pole)
   - Weryfikacja JWT token

2. **Autoryzacja**:
   - Pobranie user_id z JWT
   - Sprawdzenie dostępu do roadmapy (RLS policy)

3. **Logika biznesowa**:
   - Sprawdzenie istnienia roadmapy i elementu
   - Przygotowanie danych do aktualizacji
   - Specjalna logika dla `is_completed`:
     - Jeśli `true` → ustawienie `completed_at` na aktualny timestamp
     - Jeśli `false` → wyczyszczenie `completed_at`

4. **Aktualizacja bazy danych**:
   - Wykonanie UPDATE query z warunkami RLS
   - Zwrócenie zaktualizowanego rekordu

5. **Odpowiedź**:
   - Serializacja wyniku do JSON
   - Zwrócenie 200 OK z danymi

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: JWT Bearer token validation
- **Autoryzacja**: RLS policies zapewniają dostęp tylko do własnych zasobów
- **Walidacja danych**: Zod schemas chronią przed invalid input
- **SQL Injection**: Parametryzowane queries z Supabase client
- **Path Traversal**: UUID validation eliminuje path manipulation
- **Rate Limiting**: Rozważyć implementację w middleware

## 7. Obsługa błędów

| Scenariusz | Kod | Komunikat |
|------------|-----|-----------|
| Brak wymaganych pól | 400 | "At least one field must be provided" |
| Nieprawidłowy UUID | 400 | "Invalid roadmap ID or item ID format" |
| Walidacja body | 400 | "Validation failed: [szczegóły]" |
| Conflict pozycji | 400 | "Position conflict with existing item" |
| Brak tokenu | 401 | "Authorization token required" |
| Nieprawidłowy token | 401 | "Invalid or expired token" |
| Element nie istnieje | 404 | "Roadmap item not found" |
| Brak dostępu | 404 | "Roadmap not found" (security przez obscurity) |
| Błąd DB | 500 | "Internal server error" |

## 8. Rozważania dotyczące wydajności

- **Indeksy**: Wykorzystanie istniejących indeksów na `roadmap_id` i `parent_item_id`
- **Single Query**: Aktualizacja i fetch w jednym zapytaniu
- **RLS Optimization**: Policies wykorzystują indeksy na `user_id`
- **Caching**: Brak cachowania ze względu na mutating operation
- **Connection Pooling**: Wykorzystanie Supabase connection pool

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie walidacji
- Utworzenie Zod schemas dla request validation
- Implementacja helper functions dla UUID validation
- Testy jednostkowe dla validation logic

### Krok 2: Implementacja service layer
- Utworzenie `RoadmapItemService.updateItem()` method
- Implementacja specjalnej logiki dla `completed_at`
- Obsługa constraint violations i error mapping

### Krok 3: Implementacja endpoint handler
- Utworzenie pliku `/src/pages/api/roadmaps/[roadmapId]/items/[itemId].ts`
- Implementacja PATCH handler
- Integracja z authentication middleware

### Krok 4: Error handling i logging
- Implementacja standardowego error response format
- Dodanie appropriate logging dla błędów
- Obsługa edge cases i constraint violations
