import {
  FC,
  FormEvent,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
} from "react";
import { Title } from "shared/ui/title";
import "./authPanel.styl";
import { Button } from "shared/ui/button";
import GoogleIcon from "shared/assets/icons/googleIcon.svg?react";
import { Loader } from "shared/ui/loader";
import { ITest } from "shared/types/common";

interface AuthPanelProps extends PropsWithChildren {
  title: string;
  isLoading?: boolean;
  showGoogle?: boolean;
  submitLabel?: string;
  extraLink?: ReactNode;
  submitBtnProps?: ITest;
  extraLinkOnClick?: () => void;
  bottomExtraLink?: HTMLAttributes<HTMLDivElement>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export const AuthPanel: FC<AuthPanelProps> = ({
  title,
  children,
  onSubmit,
  isLoading,
  extraLink,
  showGoogle,
  submitLabel,
  submitBtnProps,
  bottomExtraLink,
  extraLinkOnClick,
}) => {
  const handleGoogleClick = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  return (
    <div className="flex-y-center flex-col auth-panel">
      <Title className="auth-panel-title" variant="auth">
        {title}
      </Title>

      <form className="flex-col auth-panel-form" onSubmit={onSubmit}>
        {children}

        {extraLink && <div className="auth-panel-extra-link" onClick={extraLinkOnClick}>{extraLink}</div>}

        {submitLabel && !isLoading && (
          <Button dataTestId={submitBtnProps?.dataTestId} variant="auth">{submitLabel}</Button>
        )}

        {isLoading && <Loader />}
      </form>

      {showGoogle && (
        <Button variant="google" onClick={handleGoogleClick}>
          <GoogleIcon />
          Google
        </Button>
      )}

      {bottomExtraLink && (
        <div
          className={`${"auth-panel-extra-link auth-panel-bottom-extra-link"}`}
          {...bottomExtraLink}
        />
      )}
    </div>
  );
};
