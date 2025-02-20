import { useCallback, useRef } from 'react';

export function useDebouncedCallback<Func extends (...args: any[]) => void>(
  func: Func,
  delay: number,
  dependencies: any[] = []
): Func {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    }) as Func,
    [func, delay, ...dependencies]
  );
}