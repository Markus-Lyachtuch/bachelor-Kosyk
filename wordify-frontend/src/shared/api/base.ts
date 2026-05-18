import { router } from "app/router/appRouter";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import { store } from "app/store";
import { refresh } from "features/auth/api/authApi";
import { showNegativeToast } from "shared/lib/toastify";

export const baseURL = import.meta.env.VITE_BACKEND_URL;

if (!baseURL) {
  throw new Error("VITE_BACKEND_URL is not defined");
}

type ApiError = {
  message: string;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError; status: number | null };

const rawApi = axios.create({ baseURL, withCredentials: true });

function normalizeError(error: unknown) {
  const axiosError = error as AxiosError<any>;

  if (axiosError.response) {
    return axiosError.response.data;
  }

  return {
    status: null,
    message: "Network error. Please try again later.",
  };
}

function receiveStatusError(error: unknown) {
  const axiosError = error as AxiosError<any>;

  if (axiosError.response) {
    return axiosError.response.status;
  }

  return null;
}

export interface ApiParamsFNs {
  loaderFinally?: () => void;
  loaderFNPositive?: () => void;
  loaderFNNegative?: (error?: string) => void;
}

interface ApiParams extends ApiParamsFNs {
  url: string;
  payload?: unknown;
  config?: AxiosRequestConfig;
}

export async function apiDelete<T>({
  url,
  payload,
  config,
  loaderFNPositive,
  loaderFNNegative,
  loaderFinally,
}: ApiParams): Promise<ApiResult<T>> {
  try {
    const response = await rawApi.delete<T>(url, { data: payload, ...config });
    loaderFNPositive?.();
    return { ok: true, data: response.data };
  } catch (error) {
    loaderFNNegative?.(normalizeError(error).message);
    showNegativeToast(normalizeError(error).message);
    return {
      ok: false,
      error: normalizeError(error),
      status: receiveStatusError(error),
    };
  } finally {
    loaderFinally?.();
  }
}

export async function apiPut<T>({
  url,
  payload,
  config,
  loaderFNPositive,
  loaderFNNegative,
  loaderFinally,
}: ApiParams): Promise<ApiResult<T>> {
  try {
    const response = await rawApi.put<T>(url, payload, config);
    loaderFNPositive?.();
    return { ok: true, data: response.data };
  } catch (error) {
    loaderFNNegative?.(normalizeError(error).message);
    showNegativeToast(normalizeError(error).message);
    return {
      ok: false,
      error: normalizeError(error),
      status: receiveStatusError(error),
    };
  } finally {
    loaderFinally?.();
  }
}

export async function apiPatch<T>({
  url,
  payload,
  config,
  loaderFNPositive,
  loaderFNNegative,
  loaderFinally,
}: ApiParams): Promise<ApiResult<T>> {
  try {
    const response = await rawApi.patch<T>(url, payload, config);
    loaderFNPositive?.();
    return { ok: true, data: response.data };
  } catch (error) {
    loaderFNNegative?.(normalizeError(error).message);
    showNegativeToast(normalizeError(error).message);
    return {
      ok: false,
      error: normalizeError(error),
      status: receiveStatusError(error),
    };
  } finally {
    loaderFinally?.();
  }
}

export async function apiPost<T>({
  url,
  payload,
  config,
  loaderFNPositive,
  loaderFNNegative,
  loaderFinally,
}: ApiParams): Promise<ApiResult<T>> {
  try {
    const response = await rawApi.post<T>(url, payload, config);
    loaderFNPositive?.();
    return { ok: true, data: response.data };
  } catch (error) {
    loaderFNNegative?.(normalizeError(error).message);
    if (!url.includes("auth")) {
      showNegativeToast(normalizeError(error).message);
    }
    return {
      ok: false,
      error: normalizeError(error),
      status: receiveStatusError(error),
    };
  } finally {
    loaderFinally?.();
  }
}

export async function apiGet<T>({
  url,
  config,
  loaderFNPositive,
  loaderFNNegative,
  loaderFinally,
}: ApiParams): Promise<ApiResult<T>> {
  try {
    const response = await rawApi.get<T>(url, { ...config });
    loaderFNPositive?.();
    return { ok: true, data: response.data };
  } catch (error) {
    const normalizedMessage = normalizeError(error).message;
    loaderFNNegative?.(normalizedMessage);
    if (!url.includes("autocomplete") && !url.includes("auth") && !normalizedMessage.includes("token")) {
      showNegativeToast(normalizedMessage);
    }
    return {
      ok: false,
      error: normalizeError(error),
      status: receiveStatusError(error),
    };
  } finally {
    loaderFinally?.();
  }
}

let isRefreshing = false;
let queue: Array<(ok: boolean) => void> = [];

function subscribe(cb: (ok: boolean) => void) {
  queue.push(cb);
}
function notifyAll(ok: boolean) {
  queue.forEach((cb) => cb(ok));
  queue = [];
}

rawApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const url = originalRequest?.url ?? "";

    if (url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribe((ok) => {
          if (!ok) return reject(error);
          resolve(rawApi(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      await refresh();
      isRefreshing = false;
      notifyAll(true);
      return rawApi(originalRequest);
    } catch (e) {
      isRefreshing = false;
      notifyAll(false);
      store.set(sessionAtom, null);
      router.navigate("/auth");
      return Promise.reject(e);
    }
  },
);
