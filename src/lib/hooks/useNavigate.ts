import { useCallback } from "react";

export function useNavigate() {
  return useCallback((path: string) => {
    window.location.href = path;
  }, []);
}
