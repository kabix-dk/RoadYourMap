# REST API Plan

## 1. Resources

- **User** (managed via Supabase Auth)
- **Roadmap** (`roadmaps` table)
- **RoadmapItem** (`roadmap_items` table)

## 2. Endpoints

### 2.1 Roadmaps

#### GET /api/roadmaps
- Description: List user's roadmaps
- Headers: `Authorization: Bearer <token>`
- Response (200 OK):
  ```json
  {
    "roadmaps": [
      { "id":"uuid", "title":"string", "experience_level":"string", "technology":"string", "goals":"string", "created_at":"timestamp", "updated_at":"timestamp" }
    ]
  }
  ```

#### POST /api/roadmaps/generate
- Description: Create and generate a new roadmap via AI
- Headers: `Authorization: Bearer <token>`
- Request Body:
  ```json
  {
    "title": "string",              // required
    "experience_level": "string",   // required
    "technology": "string",         // required
    "goals": "string",              // required
    "additional_info": "string"     // optional
  }
  ```
- Response (201 Created):
  ```json
  {
    "roadmap": {
      "id":"uuid", "title":"string", "experience_level":"string", "technology":"string", "goals":"string", "additional_info":"string", "created_at":"timestamp", "updated_at":"timestamp",
      "items": [ /* nested items with id, parent_item_id, title, description, level, position, is_completed, completed_at */ ]
    }
  }
  ```
- Errors:
  - 400 Bad Request: validation failures or user has 5 roadmaps

#### GET /api/roadmaps/:roadmapId
- Description: Retrieve a single roadmap with nested items
- Headers: `Authorization: Bearer <token>`
- Path Params:
  - `roadmapId`: uuid
- Response (200 OK):
  ```json
  {
    "roadmap": { /* same as POST response shape */ }
  }
  ```
- Errors:
  - 404 Not Found: nonexistent or unauthorized

#### PATCH /api/roadmaps/:roadmapId
- Description: Update roadmap metadata
- Headers: `Authorization: Bearer <token>`
- Path Params:
  - `roadmapId`: uuid
- Request Body (any subset):
  ```json
  {
    "title": "string",
    "experience_level": "string",
    "technology": "string",
    "goals": "string",
    "additional_info": "string"
  }
  ```
- Response (200 OK): updated roadmap metadata
- Errors:
  - 400 Bad Request: validation
  - 404 Not Found: nonexistent or unauthorized

#### DELETE /api/roadmaps/:roadmapId
- Description: Delete a roadmap and its items
- Headers: `Authorization: Bearer <token>`
- Path Params:
  - `roadmapId`: uuid
- Response: 204 No Content
- Errors:
  - 404 Not Found: nonexistent or unauthorized

### 2.2 Roadmap Items

#### GET /api/roadmaps/:roadmapId/items
- Description: List items for a roadmap
- Headers: `Authorization: Bearer <token>`
- Path Params:
  - `roadmapId`: uuid
- Query Params:
  - `parentItemId`: uuid or null to fetch children of given parent
- Response (200 OK):
  ```json
  { "items": [ /* flattened or nested based on parentItemId */ ] }
  ```

#### POST /api/roadmaps/:roadmapId/items
- Description: Add a new item
- Headers: `Authorization: Bearer <token>`
- Path Params:
  - `roadmapId`: uuid
- Request Body:
  ```json
  {
    "parent_item_id": "uuid|null",
    "title": "string",        // required
    "description": "string",  // optional
    "level": number,            // required
    "position": number          // required
  }
  ```
- Response (201 Created): created item JSON
- Errors:
  - 400 Bad Request: validation or unique position violation
  - 404 Not Found: invalid roadmap or parent

#### PATCH /api/roadmaps/:roadmapId/items/:itemId
- Description: Update an item (edit text, reorder, toggle completion)
- Headers: `Authorization: Bearer <token>`
- Path Params:
  - `roadmapId`: uuid
  - `itemId`: uuid
- Request Body (at least one field):
  ```json
  {
    "title": "string",
    "description": "string",
    "level": number,
    "position": number,
    "is_completed": boolean
  }
  ```
- If `is_completed` becomes `true`, set `completed_at` to server timestamp; if `false`, clear it.
- Response (200 OK): updated item JSON
- Errors:
  - 400 Bad Request: validation
  - 404 Not Found: item or roadmap not found or unauthorized

#### DELETE /api/roadmaps/:roadmapId/items/:itemId
- Description: Remove an item (cascades to children)
- Headers: `Authorization: Bearer <token>`
- Path Params:
  - `roadmapId`: uuid
  - `itemId`: uuid
- Response: 204 No Content
- Errors:
  - 404 Not Found: item or roadmap not found or unauthorized

## 3. Authentication and Authorization

- All endpoints (except `/api/auth/*`) require `Authorization: Bearer <access_token>`.
- JWT tokens issued by Supabase Auth.
- Row-Level Security policies on `roadmaps` and `roadmap_items` enforce per-user access (see DB schema).

## 4. Validation and Business Logic

- **Validation**:
  - Roadmap: `title`, `experience_level`, `technology`, `goals` must be non-empty strings.
  - Items: `title` non-empty; `level`, `position` integers.
  - Unique `(roadmap_id, parent_item_id, position)` enforced by DB; API should catch and return 400.
  - If `is_completed` is set, `completed_at` is managed server-side.
- **Business Logic**:
  - Max 5 roadmaps per user enforced by DB trigger; API catches exception and returns 400 with message.
  - AI generation is atomic within `POST /api/roadmaps`.
  - Sorting by `position` and grouping by `parent_item_id` for hierarchical display.
  - Uniform error format: `{ code: string, message: string, details?: any }`.

*End of REST API Plan* 