import { type RoadmapFormData } from "../pages/RoadmapCreationPage";
import { type LoginCredentials } from "../pages/LoginPage";

export const testUsers = {
  validUser: {
    email: process.env.E2E_USERNAME,
    password: process.env.E2E_PASSWORD,
  },
  invalidUser: {
    email: "invalid@example.com",
    password: "wrongpassword",
  },
} as const;

export const validRoadmapData: RoadmapFormData = {
  title: "React Developer Roadmap",
  experienceLevel: "Junior",
  technology: "React",
  goals: "Learn React fundamentals, hooks, and state management",
  additionalInfo: "Focus on modern React patterns and best practices",
};

export const invalidRoadmapData = {
  empty: {
    title: "",
    experienceLevel: "",
    technology: "",
    goals: "",
    additionalInfo: "",
  },
  tooLong: {
    title: "A".repeat(256), // Too long (max 255)
    experienceLevel: "B".repeat(51), // Too long (max 50)
    technology: "C".repeat(101), // Too long (max 100)
    goals: "Valid goals",
    additionalInfo: "Valid additional info",
  },
} as const;

export const testRoadmapVariations: RoadmapFormData[] = [
  {
    title: "Python Backend Development",
    experienceLevel: "Mid",
    technology: "Python",
    goals: "Master Django, FastAPI, and database design",
  },
  {
    title: "Frontend Development with Vue",
    experienceLevel: "Senior",
    technology: "Vue.js",
    goals: "Advanced Vue 3 composition API and Nuxt.js",
    additionalInfo: "Include TypeScript integration",
  },
  {
    title: "DevOps Engineering Path",
    experienceLevel: "Junior",
    technology: "Docker, Kubernetes",
    goals: "Learn containerization and orchestration",
  },
];

export const getTestUser = (): LoginCredentials => ({
  email: testUsers.validUser.email,
  password: testUsers.validUser.password,
});

export const getRandomRoadmapData = (): RoadmapFormData => {
  const randomIndex = Math.floor(Math.random() * testRoadmapVariations.length);
  return testRoadmapVariations[randomIndex];
};

export const getUniqueRoadmapData = (suffix?: string): RoadmapFormData => {
  const timestamp = Date.now();
  const uniqueSuffix = suffix || timestamp.toString();

  return {
    title: `Test Roadmap ${uniqueSuffix}`,
    experienceLevel: "Junior",
    technology: "JavaScript",
    goals: `Test goals for roadmap created at ${timestamp}`,
    additionalInfo: `Additional test info - ${uniqueSuffix}`,
  };
};
