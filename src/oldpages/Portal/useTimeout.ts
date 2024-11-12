import { useEffect, useRef } from "react";

/**
 * The useTimeout function is a custom hook that sets a timeout for a given callback function.
 * It takes in a callback function and a delay time in milliseconds as parameters.
 * It returns nothing.
 */
function useTimeout(callback: () => void, delay: number) {
  const callbackRef = useRef<() => void>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (delay !== null && callbackRef.current && typeof callbackRef.current === 'function') {
      timer = setTimeout(callbackRef.current, delay);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [delay]);
}

export default useTimeout;