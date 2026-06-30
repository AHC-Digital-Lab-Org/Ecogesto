const API_BASE = import.meta.env.VITE_API_URL || "/api";

type ApiOptions = RequestInit & { raw?: boolean };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Error ${response.status}`;
    throw new Error(message);
  }
  return Object.prototype.hasOwnProperty.call(payload, "data") ? payload.data : payload;
}

export const postJson = <T>(path: string, body: unknown) =>
  api<T>(path, {
    method: "POST",
    body: JSON.stringify(body)
  });

export const putJson = <T>(path: string, body: unknown) =>
  api<T>(path, {
    method: "PUT",
    body: JSON.stringify(body)
  });

export const patchJson = <T>(path: string, body: unknown) =>
  api<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
