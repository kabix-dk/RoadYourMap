# RoadYourMap

**RoadYourMap** is a web application that automates the generation of personalized learning roadmaps for programming languages and IT technologies. Designed as an MVP with a focus on simplicity, clarity, and ease of use, it helps technical learners plan, track, and manage their learning journey.

## Table of Contents
- [RoadYourMap](#roadyourmap)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Getting Started Locally](#getting-started-locally)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
  - [Available Scripts](#available-scripts)
  - [Project Scope](#project-scope)
    - [Included in MVP](#included-in-mvp)
  - [Project Status](#project-status)
  - [License](#license)

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, Shadcn/ui
- **Backend-as-a-Service:** Supabase (Authentication & PostgreSQL)
- **Testing:** Vitest (Unit/Integration), Playwright (E2E), React Testing Library, MSW (Mock Service Worker)
- **AI Integration:** OpenRouter.ai for model access (OpenAI, Anthropic, Google, etc.)
- **Node Version:** 22.14.0 (via .nvmrc)
- **CI/CD & Hosting:** GitHub Actions, DigitalOcean (Docker)

## Getting Started Locally

### Prerequisites
- Node.js (v22.14.0)
- npm (or Yarn)
- A Supabase project (URL & Anon Key)
- An OpenRouter.ai API key

### Setup
1. Clone the repository:
```bash
 git clone https://github.com/kabix-dk/roadyourmap.git
 cd roadyourmap
```  
2. Install dependencies:
```bash
 npm install
```  
3. Create a `.env` file in the project root and add your environment variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```  
4. Start the development server:
```bash
 npm run dev
```  
5. Open your browser and navigate to `http://localhost:3000` to see the app.

## Available Scripts

In the project directory, you can run:

- **`npm run dev`**: Runs the app in development mode.
- **`npm run build`**: Builds the production-ready site.
- **`npm run preview`**: Previews the built site locally.
- **`npm run astro`**: Access Astro CLI commands.
- **`npm run lint`**: Runs ESLint across the codebase.
- **`npm run lint:fix`**: Runs ESLint with auto-fix.
- **`npm run format`**: Formats code with Prettier.

## Project Scope

### Included in MVP
- **Roadmap Generation:** AI-powered creation of 2–3 level learning roadmaps based on user-provided experience, technology, and goals.
- **Interactive Roadmap:** Expandable list view, edit elements (add, remove, reorder), and mark items as complete.
- **Progress Tracking:** Progress bar updates with completed items.
- **User Accounts:** Supabase-based registration, login, and session management.
- **Roadmap Storage:** Save up to 5 roadmaps per user, with auto-save.
- **Error Handling:** User-friendly validation and error messages throughout the app.

## Project Status

This project is currently in **MVP / Alpha** stage. Core features are under active development. Contributions and feedback are welcome!

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
