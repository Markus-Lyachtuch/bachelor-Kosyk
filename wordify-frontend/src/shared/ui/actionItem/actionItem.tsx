import { FunctionComponent, PropsWithChildren, SVGProps } from "react";
import "./actionItem.styl";

interface IActionItem {
  Icon?: FunctionComponent<SVGProps<SVGSVGElement>>;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  className?: string;
  title?: string;
  iconName?: string;
}

export const ActionItem = ({
  Icon,
  title="",
  onClick,
  children,
  iconName,
  className="",
}: PropsWithChildren<IActionItem>) => {
  return (
    <div className={`cursor-pointer actionitem flex-y-center ${className}`} onClick={onClick}>
      {Icon && <Icon name={iconName} width={24} height={24} />}
      <span className="text-truncate">{title}{children}</span>
    </div>
  );
};
