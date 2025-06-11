import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNavigate } from "../useNavigate";

describe("useNavigate hook", () => {
  const { location } = window;

  beforeEach(() => {
    // @ts-expect-error - location is read-only
    delete window.location;
    window.location = { ...location, href: "" };
  });

  afterEach(() => {
    window.location = location;
  });

  it("should navigate to the given path", () => {
    const { result } = renderHook(() => useNavigate());
    const path = "/test-path";

    act(() => {
      result.current(path);
    });

    expect(window.location.href).toBe(path);
  });

  it("should return a memoized function", () => {
    const { result, rerender } = renderHook(() => useNavigate());
    const firstResult = result.current;

    rerender();

    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });
});
