import { apiGet, ApiParamsFNs, apiPatch, apiPost } from "shared/api/base";
import { Session } from "entities/session/model/sessionsAtom";
import { LoginFormData } from "../login/model/loginSchema";
import { ForgetPasswordFormData, ResetPasswordFormData } from "../forgetPassword/model/forgetPasswordSchema";
export type LoginParams = {
  payload: LoginFormData;
  positiveFN?: () => void;
  negativeFN?: () => void;
};

interface ConfirmationEmailParams extends ApiParamsFNs {
  token: string;
}

interface ForgetPasswordParams extends ApiParamsFNs {
  payload: ForgetPasswordFormData;
}

interface ResetPasswordParams extends ApiParamsFNs {
  payload: ResetPasswordFormData & { token: string };
}

interface UpdateProfileParams extends ApiParamsFNs {
  payload: FormData;
}

export const register = async (params: LoginParams) =>
  await apiPost<Session>({
    url: "/auth/register",
    payload: params.payload,
    loaderFNPositive: params.positiveFN,
    loaderFNNegative: params.negativeFN,
  });

export const login = async (params: LoginParams) =>
  await apiPost<Session>({
    url: "/auth/login",
    payload: params.payload,
    loaderFNPositive: params.positiveFN,
    loaderFNNegative: params.negativeFN,
  });

export const logout = async () => await apiGet({ url: "/auth/logout" });
export const fetchMe = async () => await apiGet<Session>({ url: "/auth/me" });
export const refresh = async () => await apiGet({ url: "/auth/refresh" });
export const confirmEmail = async (params?: ApiParamsFNs) =>
  await apiPost({ url: `/auth/emailConfirmation`, ...params });
export const confirmationEmail = async (params: ConfirmationEmailParams) =>
  await apiGet({ url: `/auth/emailConfirmation?token=${params.token}`, ...params });
export const forgetPassword = async (params: ForgetPasswordParams) =>
  await apiPost({ url: "/auth/forgetPassword", ...params });
export const resetPassword = async ({ payload, ...params }: ResetPasswordParams) =>
  await apiPatch({
    url: `/auth/users/password?token=${payload.token}`,
    payload: { password: payload.password, confirmPassword: payload.confirmPassword },
    ...params,
  });

export const updateProfile = async ({ payload, ...params }: UpdateProfileParams) =>
  await apiPatch<Session>({
    url: "/auth/profile",
    payload,
    ...params,
  });
