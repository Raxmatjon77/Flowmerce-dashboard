const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const ADMIN_USER_ID = import.meta.env.VITE_ADMIN_USER_ID || 'admin-001';
const TOKEN_KEY = 'flowmerce.admin.token';

let tokenPromise: Promise<string> | null = null;

async function loginAsAdmin(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: ADMIN_USER_ID,
      role: 'admin',
    }),
  });

  if (!response.ok) {
    throw new Error(`Admin login failed with status ${response.status}`);
  }

  const data = (await response.json()) as { accessToken: string };
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  return data.accessToken;
}

async function getAccessToken(): Promise<string> {
  const existing = localStorage.getItem(TOKEN_KEY);
  if (existing) {
    return existing;
  }

  if (!tokenPromise) {
    tokenPromise = loginAsAdmin().finally(() => {
      tokenPromise = null;
    });
  }

  return tokenPromise;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === '') {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(buildUrl(path, params), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }

    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' }, params);
}

export function apiPost<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}
