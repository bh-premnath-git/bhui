export const when =
  <A, B = A>(cond: unknown, fn: (arg: A) => B) =>
    (cond ? fn : ((v: A) => v as unknown as B));

export const unless =
  <A, B = A>(cond: unknown, fn: (arg: A) => B) =>
    (cond ? ((v: A) => v as unknown as B) : fn);


// More flexible compose with variadic generics
export function compose<T>(...fns: [(arg: T) => T]): (arg: T) => T;
export function compose<T, U>(...fns: [(arg: T) => U, (arg: U) => U]): (arg: T) => U;
export function compose<T, U, V>(
  ...fns: [(arg: T) => U, (arg: U) => V, (arg: V) => V]
): (arg: T) => V;
export function compose(...fns: Function[]) {
  return (value: any) => fns.reduceRight((acc, fn) => fn(acc), value);
}

// Async-aware compose
export function composeAsync<T>(...fns: Array<(arg: T) => Promise<T> | T>) {
  return async (value: T): Promise<T> => {
    return fns.reduceRight(
      async (acc, fn) => fn(await acc),
      Promise.resolve(value)
    );
  };
}

// Type-safe pipe with transformation tracking
export function pipe<A>(value: A): A;
export function pipe<A, B>(value: A, fn1: (arg: A) => B): B;
export function pipe<A, B, C>(
  value: A,
  fn1: (arg: A) => B,
  fn2: (arg: B) => C
): C;
export function pipe<A, B, C, D>(
  value: A,
  fn1: (arg: A) => B,
  fn2: (arg: B) => C,
  fn3: (arg: C) => D
): D;
export function pipe(value: any, ...fns: Function[]) {
  return fns.reduce((acc, fn) => fn(acc), value);
}

// Curry with better type safety
type CurriedFunction<T extends readonly unknown[], R> = T extends readonly [
  infer H,
  ...infer Rest
]
  ? Rest extends readonly []
    ? (arg: H) => R
    : (arg: H) => CurriedFunction<Rest, R>
  : () => R;

export function curry<T extends readonly unknown[], R>(
  fn: (...args: T) => R
): CurriedFunction<T, R> {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...(args as any));
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs);
  } as CurriedFunction<T, R>;
}

// Partial application utility
export function partial<T extends readonly unknown[], U extends readonly unknown[], R>(
  fn: (...args: [...T, ...U]) => R,
  ...partialArgs: T
): (...remainingArgs: U) => R {
  return (...remainingArgs: U) => fn(...partialArgs, ...remainingArgs);
}

// -----  Compose (right‑to‑left)  -----
export function composeOpt<T>(...fns: Array<((arg: T) => T) | null | undefined>) {
  const safe = fns.filter(Boolean) as Array<(arg: T) => T>;
  return (value: T) => safe.reduceRight((acc, fn) => fn(acc), value);
}

// -----  Pipe (left‑to‑right, first arg is value)  -----
export function pipeOpt<A>(value: A): A;
export function pipeOpt<A, B>(value: A, fn1?: (arg: A) => B | null): B | A;
export function pipeOpt(value: any, ...fns: Array<Function | null | undefined>) {
  return fns.filter(Boolean).reduce((acc, fn: Function) => fn(acc), value);
}

// Maybe/Option type for null safety
export class Maybe<T> {
  private constructor(private value: T | null | undefined) {}

  static of<T>(value: T | null | undefined): Maybe<T> {
    return new Maybe(value);
  }

  static none<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    return this.value != null ? Maybe.of(fn(this.value)) : Maybe.none<U>();
  }

  flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    return this.value != null ? fn(this.value) : Maybe.none<U>();
  }

  filter(predicate: (value: T) => boolean): Maybe<T> {
    return this.value != null && predicate(this.value) ? this : Maybe.none<T>();
  }

  getOrElse(defaultValue: T): T {
    return this.value ?? defaultValue;
  }

  isSome(): boolean {
    return this.value != null;
  }

  isNone(): boolean {
    return this.value == null;
  }
}

// Either type for error handling
export abstract class Either<L, R> {
  abstract map<U>(fn: (value: R) => U): Either<L, U>;
  abstract flatMap<U>(fn: (value: R) => Either<L, U>): Either<L, U>;
  abstract mapLeft<U>(fn: (value: L) => U): Either<U, R>;
  abstract fold<U>(leftFn: (left: L) => U, rightFn: (right: R) => U): U;
  abstract isLeft(): boolean;
  abstract isRight(): boolean;
}

export class Left<L, R> extends Either<L, R> {
  constructor(private value: L) {
    super();
  }

  map<U>(): Either<L, U> {
    return new Left<L, U>(this.value);
  }

  flatMap<U>(): Either<L, U> {
    return new Left<L, U>(this.value);
  }

  mapLeft<U>(fn: (value: L) => U): Either<U, R> {
    return new Left<U, R>(fn(this.value));
  }

  fold<U>(leftFn: (left: L) => U): U {
    return leftFn(this.value);
  }

  isLeft(): boolean {
    return true;
  }

  isRight(): boolean {
    return false;
  }
}

export class Right<L, R> extends Either<L, R> {
  constructor(private value: R) {
    super();
  }

  map<U>(fn: (value: R) => U): Either<L, U> {
    return new Right<L, U>(fn(this.value));
  }

  flatMap<U>(fn: (value: R) => Either<L, U>): Either<L, U> {
    return fn(this.value);
  }

  mapLeft<U>(): Either<U, R> {
    return new Right<U, R>(this.value);
  }

  fold<U>(_leftFn: (left: L) => U, rightFn: (right: R) => U): U {
    return rightFn(this.value);
  }

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return true;
  }
}

// Lens Pattern for Immutable Updates
export interface Lens<S, A> {
  get: (source: S) => A;
  set: (value: A) => (source: S) => S;
}

export const lens = <S, A>(
  getter: (source: S) => A,
  setter: (value: A) => (source: S) => S
): Lens<S, A> => ({
  get: getter,
  set: setter,
});

// Lens composition
export const composeLenses = <S, A, B>(
  lensA: Lens<S, A>,
  lensB: Lens<A, B>
): Lens<S, B> => ({
  get: (source: S) => lensB.get(lensA.get(source)),
  set: (value: B) => (source: S) =>
    lensA.set(lensB.set(value)(lensA.get(source)))(source),
});

// Property lens helper
export const prop = <T, K extends keyof T>(key: K): Lens<T, T[K]> =>
  lens(
    (obj: T) => obj[key],
    (value: T[K]) => (obj: T) => ({ ...obj, [key]: value })
  );

// Environment detection
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

// Memoization decorator
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Debounce with TypeScript
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle implementation
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      timeoutId = setTimeout(() => {
        inThrottle = false;
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }, limit);
    }
  };
}

// Retry with exponential backoff
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries: number;
    delay: number;
    backoff?: number;
  }
): Promise<T> {
  const { retries, delay, backoff = 2 } = options;
  
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retry(fn, {
        retries: retries - 1,
        delay: delay * backoff,
        backoff,
      });
    }
    throw error;
  }
}

// Utility for environment-specific logging
export const logger = {
  log: (...args: any[]) => {
    if (isNode) {
      console.log(...args);
    } else if (isBrowser) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (isNode) {
      console.error(...args);
    } else if (isBrowser) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isNode) {
      console.warn(...args);
    } else if (isBrowser) {
      console.warn(...args);
    }
  },
};

// Environment detection export
if (isBrowser) {
  logger.log('Running in browser environment');
} else if (isNode) {
  logger.log('Running in Node.js environment');
} else {
  logger.warn('Unknown environment - some features may not work as expected');
}