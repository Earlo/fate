import { useCallback, useEffect, useRef, useState } from 'react';
import useDebounce from './useDebounce';

export function useDebouncedRefresh(
  callback: () => void | Promise<void>,
  delay = 200,
) {
  const [signal, setSignal] = useState(0);
  const debouncedSignal = useDebounce(signal, delay);
  const lastSignalRef = useRef(debouncedSignal);

  const debounced = useCallback(() => {
    setSignal((value) => value + 1);
  }, []);

  useEffect(() => {
    if (debouncedSignal === lastSignalRef.current) {
      return;
    }
    lastSignalRef.current = debouncedSignal;
    void callback();
  }, [debouncedSignal, callback]);

  return debounced;
}
