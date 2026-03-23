import { useCallback, useEffect, useState } from "react";

export function useAsyncResource(loader, options = {}) {
  const { initialData, enabled = true } = options;
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, loader]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    data,
    isLoading,
    error,
    reload,
    setData,
  };
}
