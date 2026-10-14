import { useCallback } from "react";
import { useSearchParams } from "react-router";

/** Keeps filter state in the URL so filtered views are shareable and survive reloads. */
export function useQueryState(key: string, fallback = "all") {
  const [params, setParams] = useSearchParams();
  const value = params.get(key) ?? fallback;
  const setValue = useCallback(
    (next: string) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (!next || next === fallback) p.delete(key);
          else p.set(key, next);
          return p;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [key, fallback, setParams],
  );
  return [value, setValue] as const;
}

export function useClearQuery(keys: string[]) {
  const [, setParams] = useSearchParams();
  return useCallback(() => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        keys.forEach((k) => p.delete(k));
        return p;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [keys, setParams]);
}
