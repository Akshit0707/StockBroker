export interface CacheOptions {
  ttl?: number; 
  key: string;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}