const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const TOKEN_KEY = 'flowmerce.admin.token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function getAdminUserId(): string | null {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function loginAsAdmin(userId: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role: 'admin', password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials. Please check your admin user ID and password.');
  }

  const data = (await response.json()) as { accessToken: string };
  localStorage.setItem(TOKEN_KEY, data.accessToken);
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  window.location.replace('/login');
}
