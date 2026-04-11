type CacheEnvelope<T> = {
  value: T;
  expiresAt: number;
};

type LoadPublicCacheOptions<T> = {
  key: string;
  ttlMs: number;
  loader: () => Promise<T>;
};

const STORAGE_PREFIX = "prepbros:public-cache:";
const memoryCache = new Map<string, CacheEnvelope<unknown>>();
const inflightCache = new Map<string, Promise<unknown>>();

function getStorageKey(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredValue<T>(key: string): CacheEnvelope<T> | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(getStorageKey(key));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CacheEnvelope<T> | null;
    if (!parsed || typeof parsed.expiresAt !== "number") return null;

    return parsed;
  } catch {
    return null;
  }
}

function writeStoredValue<T>(key: string, value: CacheEnvelope<T>) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(getStorageKey(key), JSON.stringify(value));
  } catch {
    // Ignore cache storage failures.
  }
}

function clearStoredValue(key: string) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(getStorageKey(key));
  } catch {
    // Ignore cache storage failures.
  }
}

function isFresh<T>(entry: CacheEnvelope<T> | null | undefined) {
  return Boolean(entry && entry.expiresAt > Date.now());
}

export function clearPublicCache(key: string) {
  memoryCache.delete(key);
  inflightCache.delete(key);
  clearStoredValue(key);
}

export async function loadPublicCache<T>({
  key,
  ttlMs,
  loader,
}: LoadPublicCacheOptions<T>): Promise<T> {
  if (typeof window === "undefined") {
    return loader();
  }

  const memoryEntry = memoryCache.get(key) as CacheEnvelope<T> | undefined;
  if (isFresh(memoryEntry)) {
    return memoryEntry!.value;
  }

  const storedEntry = readStoredValue<T>(key);
  if (isFresh(storedEntry)) {
    memoryCache.set(key, storedEntry as CacheEnvelope<unknown>);
    return storedEntry!.value;
  }

  if (storedEntry && !isFresh(storedEntry)) {
    clearPublicCache(key);
  }

  const inflight = inflightCache.get(key) as Promise<T> | undefined;
  if (inflight) {
    return inflight;
  }

  const request = loader()
    .then((value) => {
      const entry: CacheEnvelope<T> = {
        value,
        expiresAt: Date.now() + ttlMs,
      };

      memoryCache.set(key, entry as CacheEnvelope<unknown>);
      writeStoredValue(key, entry);
      return value;
    })
    .finally(() => {
      inflightCache.delete(key);
    });

  inflightCache.set(key, request);
  return request;
}
