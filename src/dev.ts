import { onDismount, onMount, useRef } from './hooks';

export function _log(...arg: any[]) {
  __DEV__ && console.log(...arg);
}

export function _debugFunctionComponent(label: string, ...args: any[]) {
  if (__DEV__) {
    const mounted = useRef(false);

    onMount(
      () => {
        mounted.current = true;
        console.log('Mounting ' + label, ...args);
      },
      { layout: 'BEFORE' },
    );

    onDismount(() => {
      mounted.current = false;
      console.log('Dismounting ' + label, ...args);
    });

    setTimeout(() => {
      mounted.current && console.log('Rendering ' + label, ...args);
    }, 0);
  }
}
