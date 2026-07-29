/**
 * Small helper that joins class names conditionally.
 * Use it when you would rather not add a clsx + tailwind-merge dependency.
 * Falsy values are dropped and nested arrays are supported.
 */
export type ClassValue =
  | string
  | number
  | null
  | boolean
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const walk = (val: ClassValue) => {
    if (!val) return;
    if (typeof val === 'string' || typeof val === 'number') {
      out.push(String(val));
      return;
    }
    if (Array.isArray(val)) {
      val.forEach(walk);
      return;
    }
    if (typeof val === 'object') {
      for (const key in val) {
        if (val[key]) out.push(key);
      }
    }
  };

  inputs.forEach(walk);
  return out.join(' ');
}
