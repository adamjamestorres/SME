declare module "pg" {
  export class Pool {
    constructor(options?: { connectionString?: string; max?: number });
    connect(): Promise<PoolClient>;
    query<T = unknown>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
  }
  export interface PoolClient {
    query<T = unknown>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
    release(): void;
  }
}
