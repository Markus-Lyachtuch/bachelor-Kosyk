import { useAtom } from 'jotai';
import './confirmEmailPage.styl';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthPanel } from 'widgets/authPanel';
import { sessionAtom } from 'entities/session/model/sessionsAtom';
import { confirmationEmail, confirmEmail } from 'features/auth/api/authApi';
import { ConfirmEmail } from 'features/auth/confirmEmail/ui';

export const ConfirmEmailPage = () => {
    const nav = useNavigate();
    const [params] = useSearchParams();
    const [session] = useAtom(sessionAtom);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessFullyEmailConfirmed, setIsSuccessFullyEmailConfirmed] = useState(false);

    const { email } = session?.user || {};
    const token = params.get('token');

    useEffect(() => {
        if (!(email) && !token) {
            nav("/auth/login");
        } else if (email && !token) {
            const sendConfirmationEmail = async () => await confirmEmail();
            sendConfirmationEmail();
        }
    }, [session]);

    useEffect(() => {
        if (token) {
            setIsLoading(true);
            const sendConfirmationEmail = async () => {
                const result = await confirmationEmail({ token, loaderFinally: () => setIsLoading(false) });
                if (result.ok) {
                    nav("/home");
                    setIsSuccessFullyEmailConfirmed(true);
                }
            }
            sendConfirmationEmail();
        }
    }, [token]);

    const resendConfirmationEmail = async (e: FormEvent) => {
        e.preventDefault();
        await confirmEmail({ loaderFinally: () => setIsLoading(false) });
    }

    return (
        <div className='confirm-email'>
            {token ? <AuthPanel
                title="Email Confirmation"
                isLoading={isLoading}
                submitLabel={"Return to home"}
                onSubmit={() => nav("/home")}

            >
                <p className="confirm-email-message">{isLoading ? <>Confirmation of email <span className='confirm-email-message-email'>{email}</span> is under check. Please wait.</> : isSuccessFullyEmailConfirmed ? <>Confirmation of email <span className='confirm-email-message-email'>{email}</span> is confirmed. You can now use the app.</> : <></>}</p>
            </AuthPanel> : <ConfirmEmail
                title="Email Confirmation"
                isLoading={isLoading}
                onSubmit={resendConfirmationEmail}
            >
                <p className="confirm-email-message">To use the app you must verify email first. A confirmation link to verify your email address <span className='confirm-email-message-email'>{email}</span> has been sent. Please open your inbox and click the link to activate your account.</p>
            </ConfirmEmail>
            }
        </div>
    )
}
