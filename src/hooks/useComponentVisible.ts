import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for handling clicks outside a component.
 * @param {boolean} initialIsVisible - The initial visibility state of the component.
 * @returns {{
 *   ref: React.RefObject<HTMLDivElement>,
 *   isComponentVisible: boolean,
 *   setIsComponentVisible: React.Dispatch<React.SetStateAction<boolean>>
 * }}
 */
export const useComponentVisible = (initialIsVisible: boolean) => {
  const [isComponentVisible, setIsComponentVisible] = useState(initialIsVisible);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, []);

  return { ref, isComponentVisible, setIsComponentVisible };
};
