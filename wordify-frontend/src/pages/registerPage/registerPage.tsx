import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { AuthPanel } from "widgets/authPanel";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "features/auth/register";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import { RegisterForm } from "features/auth/register/ui/registerForm";
import { register as registerCallBack } from "features/auth/api/authApi";
import { RegisterFormData } from "features/auth/register/model/registerSchema";

export const RegisterPage = () => {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useAtom(sessionAtom);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    const response = await registerCallBack({
      payload: data,
      positiveFN: () => setIsLoading(false),
      negativeFN: () => setIsLoading(false),
    });

    setSession(response.ok ? response.data : null);

    if (response.ok === false) {
      setError("repeatPassword", { message: response.error.message });
    }
  };

  useEffect(() => {
    if (session && !(session?.user.isVerified)) {
      nav("/auth/confirm-email");
    }
  }, [session]);

  return (
    <AuthPanel
      showGoogle
      title="Register"
      isLoading={isLoading}
      submitLabel="Sign up"
      onSubmit={handleSubmit(onSubmit)}
      bottomExtraLink={{
        onClick: () => nav("/auth"),
        children: "Have an account? Login here.",
      }}
    >
      <RegisterForm register={register} errors={errors} />
    </AuthPanel>
  );
};
