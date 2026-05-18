import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { AuthPanel } from "widgets/authPanel";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginForm } from "features/auth/login";
import { login } from "features/auth/api/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import {
  LoginFormData,
  loginSchema,
} from "features/auth/login/model/loginSchema";

export const LoginPage = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useAtom(sessionAtom);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const response = await login({
      payload: data,
      positiveFN: () => setIsLoading(false),
      negativeFN: () => setIsLoading(false),
    });

    setSession(response.ok ? response.data : null);

    if (response.ok === false) {
      setError("password", { message: response.error.message });
    }
  };

  useEffect(() => {
    if (session && session.user.isVerified) {
      nav("/home");
    } else if (session && !(session?.user.isVerified)) {
      nav("/auth/confirm-email");
    }
  }, [session]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "google_user_already_exists") {
      setError("password", { message: "User with this email already exists." });
    }
  }, [searchParams]);

  return (
    <AuthPanel
      showGoogle
      title="Login"
      isLoading={isLoading}
      submitLabel="Sign in"
      extraLink="Forgot password?"
      onSubmit={handleSubmit(onSubmit)}
      submitBtnProps={{ dataTestId: "cypress-login-submit-btn" }}
      bottomExtraLink={{
        onClick: () => nav("/auth/register"),
        children: "Don't have an account? Register here.",
      }}
      extraLinkOnClick={() => nav("/auth/forget-password")}
    >
      <LoginForm register={register} errors={errors} />
    </AuthPanel>
  );
};
