const STORAGE_KEY = "cashual_token";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    console.warn("[Auth] Failed to store token in localStorage");
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
