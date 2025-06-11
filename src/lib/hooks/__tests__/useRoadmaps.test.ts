import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRoadmaps } from "../useRoadmaps";
import type { RoadmapSummaryWithProgressDto } from "../../../types";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Test data fixtures
const mockRoadmapData: RoadmapSummaryWithProgressDto[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "React Learning Path",
    experience_level: "Beginner",
    technology: "React",
    goals: "Learn React fundamentals",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    progress: 75.5,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "TypeScript Mastery",
    experience_level: "Intermediate",
    technology: "TypeScript",
    goals: "Master TypeScript",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z",
    progress: 42.0,
  },
];

const createMockResponse = (data: unknown, ok = true, status?: number) => {
  const responseStatus = status ?? (ok ? 200 : 500);
  return new Response(JSON.stringify(data), {
    status: responseStatus,
    headers: { "Content-Type": "application/json" },
  });
};

describe("useRoadmaps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with correct default state", () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: [] }));

      const { result } = renderHook(() => useRoadmaps());

      expect(result.current.roadmaps).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.fetchRoadmaps).toBe("function");
      expect(typeof result.current.deleteRoadmapAndUpdateList).toBe("function");
    });
  });

  describe("Fetch Roadmaps", () => {
    it("should fetch roadmaps successfully on mount", async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: mockRoadmapData }));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0][0] as Request;
      expect(fetchCall.url).toBe("http://localhost:3000/api/roadmaps");
      expect(fetchCall.method).toBe("GET");
      expect(fetchCall.headers.get("Content-Type")).toBe("application/json");

      expect(result.current.roadmaps).toEqual(mockRoadmapData);
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle empty roadmaps array", async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: [] }));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roadmaps).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it("should handle missing roadmaps property in response", async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roadmaps).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it("should handle HTTP error responses", async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ error: "Server error" }, false, 500));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roadmaps).toEqual([]);
      expect(result.current.error).toBe("Failed to fetch roadmaps");
      expect(console.error).toHaveBeenCalledWith("Error fetching roadmaps:", expect.any(Error));
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network error");
      mockFetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roadmaps).toEqual([]);
      expect(result.current.error).toBe("Network error");
      expect(console.error).toHaveBeenCalledWith("Error fetching roadmaps:", networkError);
    });

    it("should handle unknown error types", async () => {
      mockFetch.mockRejectedValueOnce("String error");

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("An error occurred while fetching roadmaps");
    });

    it("should allow manual refetch via fetchRoadmaps", async () => {
      // Initial fetch
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: [mockRoadmapData[0]] }));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roadmaps).toHaveLength(1);

      // Manual refetch with updated data
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: mockRoadmapData }));

      await result.current.fetchRoadmaps();

      await waitFor(() => {
        expect(result.current.roadmaps).toHaveLength(2);
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Delete Roadmap", () => {
    it("should delete roadmap successfully and update local state", async () => {
      // Setup initial data
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: mockRoadmapData }));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.roadmaps).toHaveLength(2);
      });

      // Mock successful delete
      mockFetch.mockResolvedValueOnce(createMockResponse({}, true, 200));

      const roadmapIdToDelete = mockRoadmapData[0].id;
      await result.current.deleteRoadmapAndUpdateList(roadmapIdToDelete);

      const lastFetchCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0] as Request;

      expect(lastFetchCall.url).toBe(`http://localhost:3000/api/roadmaps/${roadmapIdToDelete}`);
      expect(lastFetchCall.method).toBe("DELETE");
      expect(lastFetchCall.headers.get("Content-Type")).toBe("application/json");

      await waitFor(() => {
        expect(result.current.roadmaps).toHaveLength(1);
      });
      expect(result.current.roadmaps[0].id).toBe(mockRoadmapData[1].id);
      expect(result.current.error).toBe(null);
    });

    it("should handle delete HTTP errors", async () => {
      // Setup initial data
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: mockRoadmapData }));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.roadmaps).toHaveLength(2);
      });

      // Mock failed delete
      mockFetch.mockResolvedValueOnce(createMockResponse({ error: "Not found" }, false, 404));

      const roadmapIdToDelete = mockRoadmapData[0].id;

      await expect(result.current.deleteRoadmapAndUpdateList(roadmapIdToDelete)).rejects.toThrow(
        "Failed to delete roadmap"
      );

      // State should remain unchanged
      expect(result.current.roadmaps).toHaveLength(2);
      await waitFor(() => {
        expect(result.current.error).toBe("Failed to delete roadmap");
      });
    });

    it("should handle delete network errors", async () => {
      // Setup initial data
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: mockRoadmapData }));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.roadmaps).toHaveLength(2);
      });

      // Mock network error
      const networkError = new Error("Connection failed");
      mockFetch.mockRejectedValueOnce(networkError);

      const roadmapIdToDelete = mockRoadmapData[0].id;

      await expect(result.current.deleteRoadmapAndUpdateList(roadmapIdToDelete)).rejects.toThrow("Connection failed");

      expect(result.current.roadmaps).toHaveLength(2);
      await waitFor(() => {
        expect(result.current.error).toBe("Connection failed");
      });
    });

    it("should handle unknown delete errors", async () => {
      // Setup initial data
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: mockRoadmapData }));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.roadmaps).toHaveLength(2);
      });

      // Mock unknown error
      mockFetch.mockRejectedValueOnce("Unknown error");

      const roadmapIdToDelete = mockRoadmapData[0].id;

      await expect(result.current.deleteRoadmapAndUpdateList(roadmapIdToDelete)).rejects.toThrow("Unknown error");

      await waitFor(() => {
        expect(result.current.error).toBe("An error occurred while deleting roadmap");
      });
    });

    it("should not modify state when deleting non-existent roadmap", async () => {
      // Setup initial data
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: mockRoadmapData }));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.roadmaps).toHaveLength(2);
      });

      // Mock successful delete for non-existent ID
      mockFetch.mockResolvedValueOnce(createMockResponse({}, true, 200));

      const nonExistentId = "550e8400-e29b-41d4-a716-446655440999";
      await result.current.deleteRoadmapAndUpdateList(nonExistentId);

      // State should remain unchanged since ID doesn't exist
      expect(result.current.roadmaps).toHaveLength(2);
      expect(result.current.error).toBe(null);
    });
  });

  describe("State Management", () => {
    it("should clear error state on successful operations", async () => {
      // Start with an error state
      mockFetch.mockRejectedValueOnce(new Error("Initial error"));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.error).toBe("Initial error");
      });

      // Successful refetch should clear error
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: mockRoadmapData }));

      await result.current.fetchRoadmaps();

      await waitFor(() => {
        expect(result.current.error).toBe(null);
        expect(result.current.roadmaps).toEqual(mockRoadmapData);
      });
    });

    it("should maintain loading state during operations", async () => {
      const mockResponse = createMockResponse({ roadmaps: [] });
      let resolvePromise: (value: unknown) => void;

      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useRoadmaps());

      // Should be loading initially
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      setTimeout(() => {
        resolvePromise(mockResponse);
      }, 0);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Type Safety", () => {
    it("should maintain correct TypeScript types", () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: mockRoadmapData }));

      const { result } = renderHook(() => useRoadmaps());

      // Type assertions to ensure correct return types
      expect(result.current.roadmaps).toSatisfy((roadmaps: RoadmapSummaryWithProgressDto[]) => Array.isArray(roadmaps));
      expect(result.current.isLoading).toSatisfy((loading: boolean) => typeof loading === "boolean");
      expect(result.current.error).toSatisfy((error: string | null) => error === null || typeof error === "string");
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed JSON response", async () => {
      const malformedResponse = new Response("this is not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      mockFetch.mockResolvedValueOnce(malformedResponse);

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toMatch(/Unexpected token/);
      expect(result.current.roadmaps).toEqual([]);
    });

    it("should handle concurrent delete operations", async () => {
      // Setup initial data
      mockFetch.mockResolvedValueOnce(createMockResponse({ roadmaps: mockRoadmapData }));

      const { result } = renderHook(() => useRoadmaps());

      await waitFor(() => {
        expect(result.current.roadmaps).toHaveLength(2);
      });

      // Mock successful deletes
      mockFetch
        .mockResolvedValueOnce(createMockResponse({}, true, 200))
        .mockResolvedValueOnce(createMockResponse({}, true, 200));

      // Start concurrent deletes
      const deletePromises = [
        result.current.deleteRoadmapAndUpdateList(mockRoadmapData[0].id),
        result.current.deleteRoadmapAndUpdateList(mockRoadmapData[1].id),
      ];

      await Promise.all(deletePromises);

      await waitFor(() => {
        expect(result.current.roadmaps).toHaveLength(0);
      });
      expect(mockFetch).toHaveBeenCalledTimes(3); // 1 initial fetch + 2 deletes
    });
  });
});
