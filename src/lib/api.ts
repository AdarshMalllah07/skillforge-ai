const LEGACY_TOKEN_KEY = 'edtech_matrix_token';

/** Remove legacy localStorage JWT if present (migrated to httpOnly cookie). */
export function clearLegacyToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!headers.has('Content-Type') && options.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data && (data as { error?: string }).error) || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data as T;
}
