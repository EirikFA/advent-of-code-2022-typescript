export type MaybePromise<T> = T | Promise<T>;

export type Point = [number, number];

type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;

export type NumberTuple<N extends number> = Tuple<number, N>;
