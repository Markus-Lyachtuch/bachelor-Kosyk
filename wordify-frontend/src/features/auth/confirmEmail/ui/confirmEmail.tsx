import { FormEvent, PropsWithChildren, useEffect, useState } from "react";
import { AuthPanel } from "widgets/authPanel";

interface IConfirmEmail {
    title: string;
    isLoading: boolean;
    onSubmit: (...args: any[]) => void;
}

export const ConfirmEmail = ({ title, isLoading, onSubmit, children }: PropsWithChildren<IConfirmEmail>) => {
    const [seconds, setSeconds] = useState(60);

    useEffect(() => {
        if (seconds === 0) return;
        const interval = setInterval(() => {
            setSeconds((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [seconds])

    const handleResendEmail = async (e: FormEvent) => {
        e.preventDefault();
        setSeconds(60);
        await onSubmit(e);
    }

    return (
        <AuthPanel
            title={title}
            isLoading={isLoading}
            submitLabel={seconds > 0 ? `Resend email (${seconds})` : "Resend email"}
            onSubmit={seconds === 0 ? handleResendEmail : (e: FormEvent) => e.preventDefault()}

        >
            {children}
        </AuthPanel>
    )
}
