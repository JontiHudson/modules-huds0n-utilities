import { Huds0nError } from '@huds0n/error';

export function removeUndefinedProps<O extends object>(object: O) {
  return Object.entries(object).reduce(
    (acc, [key, prop]) => (prop === undefined ? acc : { ...acc, [key]: prop }),
    {},
  ) as Partial<O>;
}

export function mapObject<O extends object, StartProp, EndProp>(
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

export function deepClone<O extends object>(object: O): O {
  try {
    const objectCopy = {} as O;

    for (const key in object) {
      const value = object[key];

      if (Array.isArray(value)) {
        objectCopy[key] = Object.values(deepClone({ ...value })) as O[Extract<
          keyof O,
          string
        >];
      } else if (value?.constructor?.name === 'Object') {
        objectCopy[key] = deepClone(value);
      } else {
        objectCopy[key] = value;
      }
    }

    return objectCopy;
  } catch (error) {
    throw Huds0nError.create({
      code: 'DEEP_CLONE_ERROR',
      message: 'Unable to deep clone object',
      severity: 'ERROR',
      from: error,
    });
  }
}

export function jsonCopy<T>(target: T): T {
  return JSON.parse(JSON.stringify(target));
}

export function jsonIsEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function assignEnumerableGetter<S extends object, T extends S>(
  target: T,
  source: S,
  key: keyof S,
) {
  const descriptors = Object.getOwnPropertyDescriptor(source, key);

  if (descriptors?.get) {
    addEnumerableGetter<T, keyof S>(target, key, descriptors.get);
  } else {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: source[key],
    });
  }
}

export function assignEnumerableGetters(
  ...arg: (object | undefined | null)[]
): any {
  return arg.reduce(<S>(acc: any, source: S) => {
    if (!source) {
      return acc;
    }

    Object.entries(source).forEach(([key, value]) => {
      if (typeof value === 'object' && value?.constructor.name === 'Object') {
        acc[key] = assignEnumerableGetters({}, value);
      } else {
        assignEnumerableGetter(acc, source, key as keyof S);
      }
    });

    return acc;
  }, {});
}

export function addEnumerableGetter<T extends object, K extends keyof T>(
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

export function mergeEnumerableGetters<O extends Record<string, any>>(
  obj1: any | undefined,
  obj2: any,
): O {
  if (!obj1) return obj2;
  if (!obj2) return obj1;

  const newObj = assignEnumerableGetters({}, obj1);

  Object.entries(obj2).forEach(([key, value]: [keyof O, any]) => {
    if (
      typeof value === 'object' &&
      typeof newObj[key] === 'object' &&
      value?.constructor.name === 'Object' &&
      newObj[key]?.constructor.name === 'Object'
    ) {
      newObj[key] = assignEnumerableGetters({}, newObj[key], value);
    } else {
      assignEnumerableGetter(newObj, obj2, key);
    }
  });

  return newObj;
}
