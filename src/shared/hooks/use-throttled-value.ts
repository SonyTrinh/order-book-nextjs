import { useEffect, useRef, useState } from "react";

export const useThrottledValue = <T,>(value: T, delayMs: number): T => {
  const [throttled, setThrottled] = useState<T>(value);
  const latestRef = useRef<T>(value);

  useEffect(() => {
    latestRef.current = value;
  }, [value]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setThrottled(latestRef.current);
    }, delayMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [delayMs]);

  return throttled;
};
