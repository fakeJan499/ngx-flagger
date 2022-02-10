export const copy = <T extends Record<any, any> | null>(value: T): T => JSON.parse(JSON.stringify(value));
