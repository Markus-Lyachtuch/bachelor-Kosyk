import './forgetPasswordPage.styl';
import { zodResolver } from "@hookform/resolvers/zod";
import { forgetPassword, resetPassword } from 'features/auth/api/authApi';
import { ConfirmEmail } from 'features/auth/confirmEmail/ui';
import { ForgetPasswordFormData, forgetPasswordSchema, ResetPasswordFormData, resetPasswordSchema } from "features/auth/forgetPassword/model/forgetPasswordSchema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showPositiveToast } from 'shared/lib/toastify';
import { Input } from "shared/ui/input";
import { AuthPanel } from "widgets/authPanel"

export const ForgetPasswordPage = () => {
    const nav = useNavigate();
    const [params] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const token = params.get("token");

    const onSubmit = async (data: ForgetPasswordFormData) => {
        setIsLoading(true);
        setError(null);
        await forgetPassword({ payload: data, loaderFinally: () => setIsLoading(false), loaderFNPositive: () => setIsEmailSent(true), loaderFNNegative: (error) => setError(error as string) });
    };

    const resendConfirmationEmail = async () => {
        setError(null);
        setIsLoading(true);
        await forgetPassword({ payload: { email: getValues("email") as string }, loaderFinally: () => setIsLoading(false) });
    }

    const onSubmitReset = async (data: ResetPasswordFormData) => {
        const payload = { ...data, token: token as string };
        setIsLoading(true);
        await resetPassword({
            payload, loaderFinally: () => setIsLoading(false), loaderFNPositive: () => {
                nav("/auth/login");
                showPositiveToast("Password reset successfully. You can login with new password");
            }
        });
    }

    const {
        getValues,
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<ForgetPasswordFormData>({
        resolver: zodResolver(forgetPasswordSchema),
        mode: "onSubmit",
    });

    const {
        handleSubmit: handleSubmitReset,
        register: registerReset,
        formState: { errors: errorsReset },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onSubmit",
    });

    return (
        <div className='forget-password'>
            {isEmailSent && !token && <ConfirmEmail
                title="Email Confirmation"
                isLoading={isLoading}
                onSubmit={resendConfirmationEmail}
            >
                <p className="confirm-email-message">A confirmation link to reset your password was sent to address <span className='confirm-email-message-email'>{getValues("email")}</span>. Please open your inbox and click the link to reset password.</p>
            </ConfirmEmail>
            }

            {(!isEmailSent && !token) && <AuthPanel
                title="Forget Password"
                isLoading={isLoading}
                submitLabel={"Submit"}
                onSubmit={handleSubmit(onSubmit)}

            >
                <Input
                    variant="auth"
                    placeholder="Email"
                    {...register("email")}
                    error={(errors.email?.message || error) as string}
                />
            </AuthPanel>}

            {token && <AuthPanel
                title="Reset Password"
                isLoading={isLoading}
                submitLabel={"Submit"}
                onSubmit={handleSubmitReset(onSubmitReset)}
            >
                <Input
                    type="password"
                    variant="auth"
                    placeholder="Password"
                    {...registerReset("password")}
                    error={errorsReset.password?.message as string}
                />
                <Input
                    type="password"
                    variant="auth"
                    placeholder="Confirm Password"
                    {...registerReset("confirmPassword")}
                    error={errorsReset.confirmPassword?.message as string}
                />
            </AuthPanel>}
        </div>
    )
}
