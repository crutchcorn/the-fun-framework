export function createState<T>(initialValue: T): {
  listeners: Array<() => void>;
  value: T;
} {
  let val = initialValue;
  const listeners = [] as Array<() => void>;
  return {
    get value() {
      return val;
    },
    set value(v: T) {
      val = v;
      listeners.forEach((fn) => fn());
    },
    listeners,
  };
}
