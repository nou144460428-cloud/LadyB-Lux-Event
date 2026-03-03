const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ApiResponse<T = any> = {
  data: T;
  status: number;
};

class ApiError extends Error {
  response: {
    status: number;
    data: unknown;
  };

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.response = { status, data };
  }
}

async function request<T = any>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }

    const message =
      (data as { message?: string } | null)?.message || 'Request failed';
    throw new ApiError(message, response.status, data);
  }

  return { data: data as T, status: response.status };
}

export const api = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: unknown) =>
    request<T>('POST', path, body),
  patch: <T = any>(path: string, body?: unknown) =>
    request<T>('PATCH', path, body),
  delete: <T = any>(path: string) => request<T>('DELETE', path),
};
