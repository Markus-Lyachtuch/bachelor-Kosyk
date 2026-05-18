import { ButtonHTMLAttributes, FC } from "react";
import "./button.styl";
import { ITest } from "shared/types/common";

export type ButtonVariant = "primary" | "secondary" | "auth" | "google" | "outline" | "danger" | "outline-correct" | "outline-incorrect" | "rounded" | "sort" | "ai" | "trial";

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement>, ITest {
  variant?: ButtonVariant;
}

export const Button: FC<IButton> = ({ variant = "primary", className, dataTestId, ...props }) => {
  return <button data-testid={dataTestId} className={`btn btn-${variant} ${className}`} {...props}></button>;
};
