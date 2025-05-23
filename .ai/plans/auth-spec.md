# Specyfikacja techniczna systemu autentykacji - RoadYourMap

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Nowe strony i layouty

**Struktura nowych stron:**
- `src/pages/auth/login.astro` - strona logowania
- `src/pages/auth/register.astro` - strona rejestracji  
- `src/pages/auth/forgot-password.astro` - strona odzyskiwania hasła
- `src/pages/auth/reset-password.astro` - strona resetowania hasła

**Nowe layouty:**
- `src/layouts/AuthLayout.astro` - layout dedykowany dla stron autentykacji z centrowanym formularzem i minimalistycznym designem
- Rozszerzenie `src/layouts/Layout.astro` o obsługę danych użytkownika i nawigacji auth/non-auth

### 1.2 Komponenty autentykacji

**Komponenty React (client-side):**
- `src/components/auth/LoginForm.tsx` - formularz logowania z walidacją
- `src/components/auth/RegisterForm.tsx` - formularz rejestracji z walidacją
- `src/components/auth/ForgotPasswordForm.tsx` - formularz odzyskiwania hasła
- `src/components/auth/ResetPasswordForm.tsx` - formularz resetowania hasła
- `src/components/auth/AuthProvider.tsx` - provider kontekstu autentykacji
- `src/components/auth/ProtectedRoute.tsx` - wrapper dla stron wymagających autoryzacji

**Komponenty Astro (server-side):**
- `src/components/auth/AuthNavigation.astro` - nawigacja z uwzględnieniem stanu autentykacji
- `src/components/auth/UserProfile.astro` - komponent profilu użytkownika w headerze

### 1.3 Rozdzielenie odpowiedzialności

**Komponenty React odpowiadają za:**
- Interaktywność formularzy i walidację po stronie klienta
- Zarządzanie stanem lokalnym formularzy
- Komunikację z API autentykacji
- Obsługę błędów walidacji w czasie rzeczywistym
- Kontekst autentykacji dla całej aplikacji

**Strony Astro odpowiadają za:**
- Renderowanie server-side z weryfikacją stanu autentykacji
- Przekierowania na podstawie stanu użytkownika
- SEO i metadane stron
- Integrację z middleware autentykacji
- Hydratację komponentów React

### 1.4 Walidacja i komunikaty błędów

**Schema walidacji (Zod):**
```typescript
// src/lib/auth/validation.ts
- loginSchema: email, password (min 6 znaków)
- registerSchema: email, password, confirmPassword
- forgotPasswordSchema: email  
- resetPasswordSchema: password, confirmPassword
```

**Rodzaje komunikatów błędów:**
- Błędy walidacji formularza (client-side)
- Błędy autentykacji z Supabase (server-side)
- Błędy sieci i timeoutów
- Komunikaty sukcesu dla akcji

### 1.5 Scenariusze użytkowania

**Scenariusz rejestracji:**
1. Użytkownik wypełnia formularz rejestracji
2. Walidacja client-side (React Hook Form + Zod)
3. Wysłanie żądania do API Supabase
4. Automatyczne zalogowanie i przekierowanie do dashboard

**Scenariusz logowania:**
1. Użytkownik wypełnia formularz logowania
2. Walidacja i wysłanie żądania do Supabase Auth
3. Ustawienie sesji w cookies/localStorage
4. Przekierowanie do dashboard

**Scenariusz odzyskiwania hasła:**
1. Użytkownik podaje email
2. Wysłanie linka resetującego przez email
3. Kliknięcie w link prowadzi do strony resetowania
4. Ustawienie nowego hasła

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów API

**Nowe endpointy autentykacji:**
- `src/pages/api/auth/login.ts` - endpoint logowania
- `src/pages/api/auth/register.ts` - endpoint rejestracji
- `src/pages/api/auth/logout.ts` - endpoint wylogowania
- `src/pages/api/auth/refresh.ts` - endpoint odświeżania tokenów
- `src/pages/api/auth/forgot-password.ts` - endpoint odzyskiwania hasła
- `src/pages/api/auth/reset-password.ts` - endpoint resetowania hasła

**Rozszerzenie istniejących endpointów:**
- Wszystkie endpointy w `src/pages/api/roadmaps/` wymagają uwierzytelnienia
- Dodanie middleware autoryzacji do sprawdzania właściciela roadmapy

### 2.2 Modele danych

**Rozszerzenie typów w `src/types.ts`:**
```typescript
// User-related types
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

// Auth DTOs
export interface LoginCommand {
  email: string;
  password: string;
}

export interface RegisterCommand {
  email: string;
  password: string;
}

export interface ForgotPasswordCommand {
  email: string;
}

export interface ResetPasswordCommand {
  password: string;
  token: string;
}
```

### 2.3 Mechanizm walidacji

**Server-side walidacja:**
- Wykorzystanie Zod schemas w endpointach API
- Walidacja tokenów JWT z Supabase
- Sprawdzanie uprawnień użytkownika do roadmap
- Rate limiting dla endpointów autentykacji

### 2.4 Obsługa wyjątków

**Kategorie błędów:**
- `AuthenticationError` - błędy logowania/rejestracji
- `AuthorizationError` - brak uprawnień do zasobów
- `ValidationError` - błędy walidacji danych
- `RateLimitError` - przekroczenie limitów żądań

### 2.5 Aktualizacja renderowania server-side

**Modyfikacje w `astro.config.mjs`:**
- Wykorzystanie `experimental: { session: true }` już obecnego
- Konfiguracja cookies dla sesji autentykacji
- Ustawienia dla server-side rendering stron chronionych

## 3. SYSTEM AUTENTYKACJI

### 3.1 Konfiguracja Supabase Auth

**Rozszerzenie `src/db/supabase.client.ts`:**
- Dodanie klienta auth z odpowiednimi ustawieniami cookies
- Konfiguracja dla server-side i client-side użycia
- Dodanie funkcji helperów dla sprawdzania sesji

**Nowe pliki:**
- `src/lib/auth/supabase.ts` - dedykowany serwis autentykacji
- `src/lib/auth/session.ts` - zarządzanie sesjami użytkowników
- `src/lib/auth/guards.ts` - funkcje sprawdzające autoryzację

### 3.2 Middleware autentykacji

**Rozszerzenie `src/middleware/index.ts`:**
```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  // Istniejąca logika supabase client
  context.locals.supabase = supabaseClient;
  
  // Nowa logika autentykacji
  const session = await getSession(context);
  context.locals.session = session;
  context.locals.user = session?.user || null;
  
  // Sprawdzenie czy strona wymaga autentykacji
  if (isProtectedRoute(context.url.pathname) && !session) {
    return context.redirect('/auth/login');
  }
  
  return next();
});
```

### 3.3 Zarządzanie sesjami

**Strategia sesji:**
- Wykorzystanie Supabase Auth z automatycznym odświeżaniem tokenów
- Przechowywanie sesji w httpOnly cookies dla bezpieczeństwa
- Synchronizacja stanu między server-side i client-side
- Implementacja persistent sessions z localStorage jako fallback

### 3.4 Integracja z istniejącymi funkcjonalnościami

**Modyfikacje roadmap endpoints:**
- Dodanie sprawdzania `user_id` we wszystkich operacjach CRUD
- Implementacja Row Level Security (RLS) w Supabase
- Filtrowanie roadmap po `user_id` w zapytaniach
- Walidacja właściciela przy edycji/usuwaniu

**Aktualizacja komponentów dashboard:**
- Filtrowanie roadmap po user_id
- Dodanie komunikatów o konieczności logowania

### 3.5 Bezpieczeństwo

**Implementowane mechanizmy:**
- Row Level Security (RLS) policies w Supabase
- Rate limiting na endpointach autentykacji
- Walidacja CSRF tokenów
- Secure cookies z flagami httpOnly i secure
- Hashowanie haseł przez Supabase Auth
- Automatyczne wylogowanie po wygaśnięciu sesji

### 3.6 Migracje bazy danych

**Wymagane zmiany w schemacie:**
- Aktualizacja tabeli `roadmaps` - `user_id` jako foreign key do `auth.users`
- Podobna aktualizacja dla `roadmap_items` przez relację
- Dodanie RLS policies dla obu tabel
- Dodanie indeksów na `user_id` dla wydajności

**RLS Policies:**
```sql
-- Policy dla roadmaps
CREATE POLICY "Users can access own roadmaps" ON roadmaps
  FOR ALL USING (auth.uid() = user_id);

-- Policy dla roadmap_items (przez roadmap)
CREATE POLICY "Users can access own roadmap items" ON roadmap_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM roadmaps 
      WHERE roadmaps.id = roadmap_items.roadmap_id 
      AND roadmaps.user_id = auth.uid()
    )
  );
```

### 3.7 Obsługa stanów loading i error

**Loading states:**
- Spinner podczas logowania/rejestracji
- Skeleton loading dla chronionych stron podczas weryfikacji sesji
- Progressive enhancement - strony działają bez JS

**Error handling:**
- Toast notifications dla błędów autentykacji
- Fallback UI dla błędów sieci
- Retry mechanizmy dla nieudanych żądań auth
- Graceful degradation przy problemach z Supabase

Ta architektura zapewnia bezpieczny, skalowalny system autentykacji zintegrowany z istniejącą funkcjonalnością aplikacji, przy zachowaniu prostoty i przejrzystości zgodnie z wymaganiami MVP.