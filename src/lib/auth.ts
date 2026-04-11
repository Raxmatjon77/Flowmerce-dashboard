const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const TOKEN_KEY = 'flowmerce.admin.token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export async function login(userId: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role: 'admin' }),
  });

  if (!response.ok) {
    throw new Error(`Login failed. Please check your credentials.`);
  }

  const data = (await response.json()) as { accessToken: string };
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  return data.accessToken;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  window.location.replace('/login');
}
