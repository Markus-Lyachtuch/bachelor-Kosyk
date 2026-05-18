import { FC } from "react";
import { useForm, UseFormRegister } from "react-hook-form";
import { Input } from "shared/ui/input";
import { LoginFormData } from "../model/loginSchema";

interface ILoginForm {
  register: UseFormRegister<LoginFormData>;
  errors: ReturnType<typeof useForm>["formState"]["errors"];
}

export const LoginForm: FC<ILoginForm> = ({ register, errors }) => (
  <>
    <Input
      variant="auth"
      placeholder="Email"
      {...register("email")}
      dataTestId="cypress-login-email-input"
      error={errors.email?.message as string}
    />
    <Input
      variant="auth"
      type="password"
      placeholder="Password"
      {...register("password")}
      dataTestId="cypress-login-password-input"
      error={errors.password?.message as string}
    />
  </>
);
