import { FC, PropsWithChildren } from "react";
import "./title.styl";
import { ITest } from "shared/types/common";

interface ITitle extends PropsWithChildren, ITest {
  className?: string;
  variant?: "auth" | "welcome" | "primary" | "small" | "small-2" | "small-3";
  fontWeight?: "semibold";
}

export const Title: FC<ITitle> = ({ children, className, variant, fontWeight, dataTestId }) => {
  return <h2 data-testid={dataTestId} className={`title-${variant} title-${fontWeight} ${className}`}>{children}</h2>;
};
