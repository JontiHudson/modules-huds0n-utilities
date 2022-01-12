import {
  useEffect as useEffectRN,
  useLayoutEffect,
  useRef,
  useState as useStateRN,
} from "react";

import type { Types } from "../types";

export function useEffect(
  effectFunction: () => any,
  dependencies?: any[],
  {
    layout,
    skipMounts,
    runOnce,
  }: {
    layout?: Types.LayoutTiming;
    skipMounts?: boolean;
    runOnce?: boolean;
  } = {}
) {
  const effect = layout === "BEFORE" ? useLayoutEffect : useEffectRN;

  if (skipMounts || runOnce) {
    const run = useRef(false);

    onDismount(() => {
      run.current = false;
    });

    effect(() => {
      if (run.current) {
        if (runOnce) {
          run.current = false;
        }
        return useEffectLayoutTiming(effectFunction, layout);
      }
      return undefined;
    }, dependencies);

    onMount(() => {
      run.current = true;
    });
  } else {
    effect(() => useEffectLayoutTiming(effectFunction, layout), dependencies);
  }
}

function useEffectLayoutTiming(
  effectFunction: () => any,
  layout?: Types.LayoutTiming
) {
  switch (layout) {
    case "END":
      setTimeout(effectFunction, 0);
      return undefined;

    case "AFTER":
      requestAnimationFrame(effectFunction);
      return undefined;

    default:
      const cleanupFn = effectFunction();
      return cleanupFn instanceof Promise ? undefined : cleanupFn;
  }
}

export function onMount(
  onMountFunction: () => any,
  options?: {
    layout?: Types.LayoutTiming;
  }
) {
  useEffect(
    () => {
      onMountFunction();
    },
    [],
    { layout: options?.layout }
  );
}

export function onDismount(onDismountFunction: () => void) {
  useEffect(() => () => onDismountFunction(), []);
}

export function useForceUpdate(): () => void {
  const setState = useState({})[1];

  return () => {
    setState({});
  };
}

export function useMounted() {
  const isMounted = useRef<boolean | "MOUNTING">("MOUNTING");

  onMount(
    () => {
      isMounted.current = true;
    },
    { layout: "AFTER" }
  );

  onDismount(() => {
    isMounted.current = false;
  });

  return isMounted;
}

export function useState<T>(
  initialState: () => T
): [T, (newState: T | ((prevState: T) => T)) => void];
export function useState<T>(
  initialState: T
): [T, (newState: T | ((prevState: T) => T)) => void];
export function useState<T>(
  initialState: T
): [T, (newState: T | ((prevState: T) => T)) => void] {
  const isMounted = useMounted();

  const [state, setStateRN] = useStateRN(initialState);

  function setState(newState: T | ((prevState: T) => T)) {
    isMounted.current && setStateRN(newState);
  }

  return [state, setState];
}
