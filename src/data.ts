import Error from '@huds0n/error';

export function removeUndefinedProps<O extends Object>(object: O) {
  return Object.entries(object).reduce(
    (acc, [key, prop]) => (prop === undefined ? acc : { ...acc, [key]: prop }),
    {},
  ) as Partial<O>;
}

export function mapObject<O extends Object, StartProp, EndProp>(
  object: O,
  callback: (prop: StartProp, key: string) => EndProp,
) {
  return Object.entries(object).reduce(
    (acc, [key, prop]) => ({ ...acc, [key]: callback(prop as StartProp, key) }),
    {},
  ) as Record<keyof O, EndProp>;
}

export function toArray<E>(source: undefined | E | E[]): E[] {
  if (source === undefined) return [] as E[];
  return Array.isArray(source) ? source : [source];
}

export function shallowCompareArrays(a: any, b: any) {
  const aArr = toArray(a);
  const bArr = toArray(b);

  if (aArr.length !== bArr.length) {
    return false;
  }

  return !aArr.some((e, i) => e !== bArr[i]);
}

export function deepClone<O extends Object>(object: O): O {
  try {
    const objectCopy = {};

    for (const key in object) {
      const value = object[key];

      if (Array.isArray(value)) {
        // @ts-ignore
        objectCopy[key] = Object.values(deepClone({ ...value }));
        // @ts-ignore
      } else if (value?.constructor?.name === 'Object') {
        // @ts-ignore
        objectCopy[key] = deepClone(value);
      } else {
        // @ts-ignore
        objectCopy[key] = value;
      }
    }

    // @ts-ignore
    return objectCopy;
  } catch (error) {
    throw Error.transform(error, {
      code: 'DEEP_CLONE_ERROR',
      message: 'Unable to deep clone object',
      severity: 'HIGH',
    });
  }
}

export function mergeObjects<O extends Record<string, any>>(
  obj1: any | undefined,
  obj2: any,
): O {
  if (!obj1) return obj2;
  if (!obj2) return obj1;

  const oldObj = {} as any;
  const newObj = { ...obj2 };

  Object.entries(obj1).forEach(([key, value]: [keyof O, any]) => {
    if (
      typeof value === 'object' &&
      typeof obj1[key] === 'object' &&
      value?.constructor.name === 'Object' &&
      obj1[key]?.constructor.name === 'Object'
    ) {
      newObj[key] = { ...value, ...obj2[key] };
    } else if (!(key in obj2)) {
      oldObj[key] = value;
    }
  });

  return { ...oldObj, ...newObj };
}

export function JSONcopy<T>(target: T): T {
  return JSON.parse(JSON.stringify(target));
}

export function JSONisEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function addEnumerableGetter<T extends Object, K extends keyof T>(
  target: T,
  key: K,
  callback: () => T[K],
) {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get: callback,
  });

  return target;
}

export function assignEnumerableGetters(
  ...arg: (Object | undefined | null)[]
): any {
  const [target = {}, ...rest] = arg;

  return rest.reduce((acc, source) => {
    if (!source) {
      return acc;
    }

    Object.keys(source).forEach((sourceKey) => {
      const descriptors = Object.getOwnPropertyDescriptor(source, sourceKey);

      if (descriptors?.get) {
        Object.defineProperty(acc, sourceKey, {
          configurable: true,
          enumerable: true,
          get: descriptors.get,
        });
      } else {
        Object.defineProperty(acc, sourceKey, {
          configurable: true,
          enumerable: true,
          // @ts-ignore
          value: source[sourceKey],
        });
      }
    });

    return acc;
  }, target);
}
