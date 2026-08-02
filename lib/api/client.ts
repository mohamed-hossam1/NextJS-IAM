import axios, { type AxiosRequestConfig } from "axios";
import { ApiError } from "@/lib/next-action-handler/error/errors";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"
).replace(/\/$/, "");

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use(async (config) => {
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      if (cookieHeader) {
        config.headers.set("Cookie", cookieHeader);
      }
    } catch {}
  }

  return config;
});

instance.interceptors.response.use(
  async (response) => {
    await forwardSetCookieHeaders(response.headers["set-cookie"]);
    return response;
  },
  async (error) => {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new ApiError(500, error?.message || "Network Error", error);
    }

    const { status, data } = error.response;

    if (status === 401 && !error.config?.__isRetry) {
      const refreshed = await tryRefreshAccessToken();
      if (refreshed && error.config) {
        error.config.__isRetry = true;
        error.config.headers.set("Authorization", `Bearer ${accessToken}`);
        return instance.request(error.config);
      }
    }

    throw new ApiError(status, extractErrorMessage(data, error.message), error);
  },
);

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/refresh`, undefined, {
        withCredentials: true,
      });

      await forwardSetCookieHeaders(res.headers["set-cookie"]);

      const newToken = res.data?.accessToken;
      if (newToken) {
        setAccessToken(newToken);
        return true;
      }
      return false;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function forwardSetCookieHeaders(
  setCookieHeader: string | string[] | undefined,
) {
  if (typeof window !== "undefined" || !setCookieHeader) return;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const cookieStrings = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader];

    for (const raw of cookieStrings) {
      const parsed = parseSetCookie(raw);
      if (parsed) await cookieStore.set(parsed);
    }
  } catch {}
}

function parseSetCookie(raw: string) {
  const parts = raw.split(";").map((p) => p.trim());
  const [head, ...rest] = parts;
  const eqIdx = head.indexOf("=");
  if (eqIdx <= 0) return null;

  const name = head.substring(0, eqIdx);
  const value = head.substring(eqIdx + 1);

  let maxAge: number | undefined;
  let path: string | undefined = "/";
  let httpOnly = false;
  let secure = false;
  let sameSite: "lax" | "strict" | "none" | undefined;

  for (const part of rest) {
    const [k, v] = part.split("=");
    const key = (k || "").toLowerCase();
    if (key === "max-age" && v) maxAge = parseInt(v, 10);
    if (key === "path" && v) path = v;
    if (key === "httponly") httpOnly = true;
    if (key === "secure") secure = true;
    if (key === "samesite" && v) {
      const s = v.toLowerCase();
      if (s === "lax" || s === "strict" || s === "none") sameSite = s;
    }
  }

  return {
    name,
    value,
    path,
    httpOnly,
    secure,
    sameSite,
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.message)) return d.message.join(", ");
  if (typeof d.message === "string") return d.message;
  return fallback;
}

declare module "axios" {
  interface InternalAxiosRequestConfig {
    __isRetry?: boolean;
  }
}

export const apiClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.get<T>(url, config);
    return response.data;
  },

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await instance.post<T>(url, data, config);
    return response.data;
  },

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await instance.patch<T>(url, data, config);
    return response.data;
  },

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await instance.put<T>(url, data, config);
    return response.data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.delete<T>(url, config);
    return response.data;
  },
};
