export type KeysPostfixDeep<T, P extends string> = {
  [K in keyof T as `${string & K}${P}`]: T[K] extends object ? KeysPostfixDeep<T[K], P> : T[K];
};
