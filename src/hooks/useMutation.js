import { useCallback, useState } from "react";

export function useMutation(action) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await action(payload);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [action],
  );

  return {
    mutate,
    isLoading,
    error,
    data,
    setError,
    setData,
  };
}
