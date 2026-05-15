import Redis from 'ioredis';
import { createHash } from 'crypto';

const DEFAULT_TTL = 3600;
const KEY_PREFIX = 'semanticraft:parse:';
const MEMORY_CACHE_MAX_SIZE = 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];

  set(key: string, value: T, ttlMs: number): void {
    this.evictIfNeeded();
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    this.updateAccessOrder(key);
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }
    this.updateAccessOrder(key);
    return entry.value;
  }

  delete(key: string): void {
    this.store.delete(key);
    this.removeFromAccessOrder(key);
  }

  clear(): void {
    this.store.clear();
    this.accessOrder = [];
  }

  private evictIfNeeded(): void {
    if (this.store.size >= MEMORY_CACHE_MAX_SIZE) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}

export class CacheService {
  private redis: Redis | null = null;
  private memory = new MemoryCache<unknown>();
  private redisAvailable = false;

  async initialize(redisUrl?: string): Promise<void> {
    if (!redisUrl) {
      this.redisAvailable = false;
      return;
    }

    try {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        enableOfflineQueue: false,
      });

      await this.redis.ping();
      this.redisAvailable = true;

      this.redis.on('error', () => {
        this.redisAvailable = false;
      });

      this.redis.on('connect', () => {
        this.redisAvailable = true;
      });
    } catch {
      this.redisAvailable = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redisAvailable && this.redis) {
      try {
        const cached = await this.redis.get(key);
        if (cached) {
          return JSON.parse(cached) as T;
        }
      } catch {
        this.redisAvailable = false;
      }
    }

    return this.memory.get(key) as T | null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.redisAvailable && this.redis) {
      try {
        await this.redis.setex(key, ttlSeconds, serialized);
        this.memory.set(key, value, ttlSeconds * 1000);
        return;
      } catch {
        this.redisAvailable = false;
      }
    }

    this.memory.set(key, value, ttlSeconds * 1000);
  }

  async invalidate(key: string): Promise<void> {
    if (this.redisAvailable && this.redis) {
      try {
        await this.redis.del(key);
      } catch {
        this.redisAvailable = false;
      }
    }

    this.memory.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (this.redisAvailable && this.redis) {
      try {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch {
        this.redisAvailable = false;
      }
    }
  }

  async clear(): Promise<void> {
    if (this.redisAvailable && this.redis) {
      try {
        const keys = await this.redis.keys(`${KEY_PREFIX}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch {
        this.redisAvailable = false;
      }
    }

    this.memory.clear();
  }

  getContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  buildCacheKey(contentHash: string): string {
    return `${KEY_PREFIX}${contentHash}`;
  }
}

export const cacheService = new CacheService();