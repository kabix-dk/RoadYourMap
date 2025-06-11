import { describe, it, expect } from "vitest";
import { createRoadmapFormSchema } from "../RoadmapCreationForm";

describe("createRoadmapFormSchema", () => {
  describe("title field validation", () => {
    it("should accept valid title", () => {
      const validData = {
        title: "Learn React Development",
        experience_level: "Junior",
        technology: "React",
        goals: "Build modern web applications",
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Learn React Development");
      }
    });

    it("should reject empty title", () => {
      const invalidData = {
        title: "",
        experience_level: "Junior",
        technology: "React",
        goals: "Build modern web applications",
      };

      const result = createRoadmapFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["title"],
              message: "Tytuł jest wymagany.",
            }),
          ])
        );
      }
    });

    it("should accept title with only whitespace (Zod min(1) behavior)", () => {
      const validData = {
        title: "   ",
        experience_level: "Junior",
        technology: "React",
        goals: "Build modern web applications",
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      // Zod's min(1) accepts whitespace because length > 0
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("   ");
      }
    });

    it("should accept title at maximum length (255 characters)", () => {
      const maxLengthTitle = "a".repeat(255);
      const validData = {
        title: maxLengthTitle,
        experience_level: "Junior",
        technology: "React",
        goals: "Build modern web applications",
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(maxLengthTitle);
        expect(result.data.title.length).toBe(255);
      }
    });

    it("should reject title exceeding maximum length (256 characters)", () => {
      const tooLongTitle = "a".repeat(256);
      const invalidData = {
        title: tooLongTitle,
        experience_level: "Junior",
        technology: "React",
        goals: "Build modern web applications",
      };

      const result = createRoadmapFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["title"],
              message: "Tytuł może mieć maksymalnie 255 znaków.",
            }),
          ])
        );
      }
    });

    it("should accept title with special characters and unicode", () => {
      const specialTitle = "Nauka React.js & TypeScript 🚀 (2024)";
      const validData = {
        title: specialTitle,
        experience_level: "Junior",
        technology: "React",
        goals: "Build modern web applications",
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(specialTitle);
      }
    });
  });

  describe("experience_level field validation", () => {
    it("should accept valid experience levels", () => {
      const validLevels = ["Junior", "Mid", "Senior", "Beginner", "Intermediate", "Advanced"];

      validLevels.forEach((level) => {
        const validData = {
          title: "Test Roadmap",
          experience_level: level,
          technology: "React",
          goals: "Learn programming",
        };

        const result = createRoadmapFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.experience_level).toBe(level);
        }
      });
    });

    it("should reject empty experience level", () => {
      const invalidData = {
        title: "Test Roadmap",
        experience_level: "",
        technology: "React",
        goals: "Learn programming",
      };

      const result = createRoadmapFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["experience_level"],
              message: "Poziom doświadczenia jest wymagany.",
            }),
          ])
        );
      }
    });

    it("should accept experience level at maximum length (50 characters)", () => {
      const maxLengthLevel = "a".repeat(50);
      const validData = {
        title: "Test Roadmap",
        experience_level: maxLengthLevel,
        technology: "React",
        goals: "Learn programming",
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.experience_level.length).toBe(50);
      }
    });

    it("should reject experience level exceeding maximum length (51 characters)", () => {
      const tooLongLevel = "a".repeat(51);
      const invalidData = {
        title: "Test Roadmap",
        experience_level: tooLongLevel,
        technology: "React",
        goals: "Learn programming",
      };

      const result = createRoadmapFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["experience_level"],
              message: "Poziom doświadczenia może mieć maksymalnie 50 znaków.",
            }),
          ])
        );
      }
    });
  });

  describe("technology field validation", () => {
    it("should accept popular technologies", () => {
      const validTechnologies = [
        "React",
        "Vue.js",
        "Angular",
        "Python",
        "Java",
        "JavaScript",
        "TypeScript",
        "Node.js",
        "C#",
        "Go",
        "Rust",
        "PHP",
      ];

      validTechnologies.forEach((tech) => {
        const validData = {
          title: "Test Roadmap",
          experience_level: "Junior",
          technology: tech,
          goals: "Learn programming",
        };

        const result = createRoadmapFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.technology).toBe(tech);
        }
      });
    });

    it("should reject empty technology", () => {
      const invalidData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: "",
        goals: "Learn programming",
      };

      const result = createRoadmapFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["technology"],
              message: "Technologia jest wymagana.",
            }),
          ])
        );
      }
    });

    it("should accept technology at maximum length (100 characters)", () => {
      const maxLengthTech = "a".repeat(100);
      const validData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: maxLengthTech,
        goals: "Learn programming",
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.technology.length).toBe(100);
      }
    });

    it("should reject technology exceeding maximum length (101 characters)", () => {
      const tooLongTech = "a".repeat(101);
      const invalidData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: tooLongTech,
        goals: "Learn programming",
      };

      const result = createRoadmapFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["technology"],
              message: "Technologia może mieć maksymalnie 100 znaków.",
            }),
          ])
        );
      }
    });

    it("should accept technology with version numbers and special characters", () => {
      const complexTech = "React 18.x + TypeScript 5.0";
      const validData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: complexTech,
        goals: "Learn programming",
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.technology).toBe(complexTech);
      }
    });
  });

  describe("goals field validation", () => {
    it("should accept valid goals", () => {
      const validGoals = [
        "Build web applications",
        "Learn backend development and create REST APIs",
        "Master data structures and algorithms for technical interviews",
        "Become proficient in mobile app development using React Native",
      ];

      validGoals.forEach((goals) => {
        const validData = {
          title: "Test Roadmap",
          experience_level: "Junior",
          technology: "React",
          goals: goals,
        };

        const result = createRoadmapFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.goals).toBe(goals);
        }
      });
    });

    it("should reject empty goals", () => {
      const invalidData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: "React",
        goals: "",
      };

      const result = createRoadmapFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["goals"],
              message: "Cele są wymagane.",
            }),
          ])
        );
      }
    });

    it("should accept goals with only whitespace (Zod min(1) behavior)", () => {
      const validData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: "React",
        goals: "   \n\t   ",
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      // Zod's min(1) accepts whitespace because length > 0
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goals).toBe("   \n\t   ");
      }
    });

    it("should accept very long goals (no length limit)", () => {
      const longGoals = "a".repeat(5000); // Very long text
      const validData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: "React",
        goals: longGoals,
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goals).toBe(longGoals);
        expect(result.data.goals.length).toBe(5000);
      }
    });

    it("should accept goals with multiline text and special formatting", () => {
      const formattedGoals = `
        1. Learn React fundamentals
        2. Build 3 projects:
           - Todo app
           - Weather dashboard
           - E-commerce site
        3. Deploy to production
        
        Additional notes: Focus on hooks & modern patterns.
      `.trim();

      const validData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: "React",
        goals: formattedGoals,
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goals).toBe(formattedGoals);
      }
    });
  });

  describe("additional_info field validation", () => {
    it("should accept valid additional info", () => {
      const validData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: "React",
        goals: "Learn programming",
        additional_info: "Focus on modern React patterns and hooks",
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.additional_info).toBe("Focus on modern React patterns and hooks");
      }
    });

    it("should accept empty additional info (optional field)", () => {
      const validData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: "React",
        goals: "Learn programming",
        additional_info: "",
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.additional_info).toBe("");
      }
    });

    it("should accept undefined additional info (optional field)", () => {
      const validData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: "React",
        goals: "Learn programming",
        // additional_info is not provided
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.additional_info).toBeUndefined();
      }
    });

    it("should accept very long additional info (no length limit)", () => {
      const longAdditionalInfo = "a".repeat(10000);
      const validData = {
        title: "Test Roadmap",
        experience_level: "Junior",
        technology: "React",
        goals: "Learn programming",
        additional_info: longAdditionalInfo,
      };

      const result = createRoadmapFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.additional_info).toBe(longAdditionalInfo);
        expect(result.data.additional_info?.length).toBe(10000);
      }
    });
  });

  describe("complete form validation scenarios", () => {
    it("should accept minimal valid form data", () => {
      const minimalData = {
        title: "A",
        experience_level: "B",
        technology: "C",
        goals: "D",
      };

      const result = createRoadmapFormSchema.safeParse(minimalData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchInlineSnapshot(`
          {
            "experience_level": "B",
            "goals": "D",
            "technology": "C",
            "title": "A",
          }
        `);
      }
    });

    it("should accept complete valid form data", () => {
      const completeData = {
        title: "Complete React Learning Path",
        experience_level: "Intermediate",
        technology: "React + TypeScript",
        goals: "Build production-ready applications with modern React patterns",
        additional_info: "Focus on performance optimization and testing strategies",
      };

      const result = createRoadmapFormSchema.safeParse(completeData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(completeData);
      }
    });

    it("should collect all validation errors for invalid form", () => {
      const invalidData = {
        title: "", // Required field empty
        experience_level: "a".repeat(51), // Too long
        technology: "", // Required field empty
        goals: "", // Required field empty (not just whitespace)
        additional_info: "Valid additional info",
      };

      const result = createRoadmapFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have 4 errors: title empty, experience_level too long, technology empty, goals empty
        expect(result.error.issues).toHaveLength(4);
        expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
          expect.arrayContaining(["title", "experience_level", "technology", "goals"])
        );
      }
    });

    it("should handle missing required fields", () => {
      const incompleteData = {
        title: "Test Roadmap",
        // Missing: experience_level, technology, goals
      };

      const result = createRoadmapFormSchema.safeParse(incompleteData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
        expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
          expect.arrayContaining(["experience_level", "technology", "goals"])
        );
      }
    });

    it("should handle null values gracefully", () => {
      const dataWithNulls = {
        title: null,
        experience_level: null,
        technology: null,
        goals: null,
        additional_info: null,
      };

      const result = createRoadmapFormSchema.safeParse(dataWithNulls);

      expect(result.success).toBe(false);
      if (!result.success) {
        // All required fields should fail validation
        expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe("edge cases and business rules", () => {
    it("should preserve exact input values without transformation", () => {
      const dataWithSpaces = {
        title: "  React Learning Path  ",
        experience_level: "  Junior  ",
        technology: "  React.js  ",
        goals: "  Learn React fundamentals  ",
        additional_info: "  Focus on hooks  ",
      };

      const result = createRoadmapFormSchema.safeParse(dataWithSpaces);

      expect(result.success).toBe(true);
      if (result.success) {
        // Zod should preserve the exact input including spaces
        expect(result.data.title).toBe("  React Learning Path  ");
        expect(result.data.experience_level).toBe("  Junior  ");
        expect(result.data.technology).toBe("  React.js  ");
        expect(result.data.goals).toBe("  Learn React fundamentals  ");
        expect(result.data.additional_info).toBe("  Focus on hooks  ");
      }
    });

    it("should handle unicode and international characters", () => {
      const unicodeData = {
        title: "Nauka React.js 🚀 - Ścieżka rozwoju",
        experience_level: "Początkujący",
        technology: "React.js + TypeScript",
        goals: "Zostać ekspertem w React.js i zbudować nowoczesne aplikacje webowe",
        additional_info: "Skupić się na najnowszych wzorcach i bibliotekach ekosystemu React",
      };

      const result = createRoadmapFormSchema.safeParse(unicodeData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(unicodeData);
      }
    });

    it("should handle boundary values correctly", () => {
      const boundaryData = {
        title: "x".repeat(255), // Exactly at limit
        experience_level: "y".repeat(50), // Exactly at limit
        technology: "z".repeat(100), // Exactly at limit
        goals: "w".repeat(1), // Minimum length
        additional_info: "", // Empty optional field
      };

      const result = createRoadmapFormSchema.safeParse(boundaryData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title.length).toBe(255);
        expect(result.data.experience_level.length).toBe(50);
        expect(result.data.technology.length).toBe(100);
        expect(result.data.goals.length).toBe(1);
        expect(result.data.additional_info).toBe("");
      }
    });
  });
});
