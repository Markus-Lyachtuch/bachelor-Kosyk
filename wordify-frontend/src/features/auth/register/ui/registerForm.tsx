import { FC } from "react";
import { Input } from "shared/ui/input";
import { useForm, UseFormRegister } from "react-hook-form";
import { RegisterFormData } from "../model/registerSchema";

interface IRegisterForm {
  register: UseFormRegister<RegisterFormData>;
  errors: ReturnType<typeof useForm>["formState"]["errors"];
}

export const RegisterForm: FC<IRegisterForm> = ({ register, errors }) => {
  return (
    <>
      <Input
        variant="auth"
        placeholder="Email"
        {...register("email")}
        error={errors.email?.message as string}
      />
      <Input
        variant="auth"
        type="password"
        placeholder="Password"
        {...register("password")}
        error={errors.password?.message as string}
      />
      <Input
        variant="auth"
        type="password"
        placeholder="Repeat Password"
        {...register("repeatPassword")}
        error={errors.repeatPassword?.message as string}
      />
    </>
  );
};
