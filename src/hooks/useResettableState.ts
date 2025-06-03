import { useState, useEffect } from 'react';

export function useResettableState<T>(
  initializer: () => T,
  deps: React.DependencyList
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initializer);
  
  useEffect(() => {
    setState(initializer());
  }, deps);
  
  return [state, setState];
}
