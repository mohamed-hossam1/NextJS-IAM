const isServer = typeof window === "undefined";

function readRequired(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `[env] Required environment variable "${name}" is missing. ` +
        `Set it in your environment before building/running the app.`,
    );
  }
  return value;
}

function readOptional(value: string | undefined): string | undefined {
  return value && value.trim() !== "" ? value : undefined;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const NEXT_PUBLIC_APP_URL = stripTrailingSlash(
  readRequired(
    "NEXT_PUBLIC_APP_URL",
    process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_BASE_URL ??
      "http://localhost:3000",
  ),
);

const NEXT_PUBLIC_API_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
);

let serverEnvCache: {
  BACKEND_API_URL: string;
  PINGRAM_API_KEY: string;
  PINGRAM_BASE_URL: string;
  NODE_ENV: "development" | "test" | "production";
} | null = null;

function getServerEnv() {
  if (!isServer) {
    throw new Error(
      "[env] Server-only environment variables accessed from the client. " +
        "Move this access to a server module ('use server' or RSC).",
    );
  }
  if (serverEnvCache) return serverEnvCache;

  serverEnvCache = {
    BACKEND_API_URL: NEXT_PUBLIC_API_URL,
    PINGRAM_API_KEY: readRequired(
      "PINGRAM_API_KEY",
      process.env.PINGRAM_API_KEY,
    ),
    PINGRAM_BASE_URL: readRequired(
      "PINGRAM_BASE_URL",
      process.env.PINGRAM_BASE_URL,
    ),
    NODE_ENV: (readOptional(process.env.NODE_ENV) ?? "development") as
      | "development"
      | "test"
      | "production",
  };

  return serverEnvCache;
}

export const publicEnv = {
  appUrl: NEXT_PUBLIC_APP_URL,
  apiUrl: NEXT_PUBLIC_API_URL,
} as const;

export { getServerEnv as serverEnv };
