export interface Db {
  query<T = unknown>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
}

export interface CustomerRow {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
}
