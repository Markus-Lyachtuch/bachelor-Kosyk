import { forwardRef, PropsWithChildren } from "react";
import "./popover.styl";

interface IPopover {
  className?: string;
}

export const Popover = forwardRef<HTMLDivElement, PropsWithChildren<IPopover>>(
  ({ children, className }: PropsWithChildren<IPopover>, ref) => {
    return (
      <div ref={ref} className={`popover ${className}`}>
        {children}
      </div>
    );
  },
);
