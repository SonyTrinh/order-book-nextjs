import { create, type ApisauceInstance } from "apisauce";

import { env } from "@/shared/config/env";

type AuthTokenResolver = (() => string | null | undefined) | null;

let authTokenResolver: AuthTokenResolver = null;

export const setApiAuthTokenResolver = (resolver: AuthTokenResolver): void => {
  authTokenResolver = resolver;
};

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "";
  }
  return env.apiBaseUrl;
};

const buildApiClient = (): ApisauceInstance => {
  const api = create({
    baseURL: getBaseUrl(),
    timeout: env.apiTimeoutMs,
  });

  api.addRequestTransform((request) => {
    const token = authTokenResolver?.();

    if (token) {
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  });

  return api;
};

export const apiClient = buildApiClient();
