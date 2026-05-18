import { forwardRef } from "react";
import "./input.styl";
import { ITest } from "shared/types/common";

interface IInput extends React.InputHTMLAttributes<HTMLInputElement>, ITest {
  variant?: "default" | "auth" | "study";
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, IInput>(
  ({ variant = "default", className = "", error, dataTestId, ...props }, ref) => {
    return (
      <div className="input-container">
        <input
          ref={ref}
          data-testid={dataTestId}
          className={`input input-${variant} ${className}`}
          {...props}
        />
        {error && <div className="input-error">{error}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";
