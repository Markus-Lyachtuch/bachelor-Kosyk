import "./xIconBtn.styl";
import { MouseEventHandler } from "react";
import X from "shared/assets/icons/x.svg?react";

interface IXIconBtn {
    width?: number;
    height?: number;
    className?: string;
    onClick: MouseEventHandler<SVGSVGElement>;
}

export const XIconBtn = ({ onClick, width=16, height=16, className }: IXIconBtn) => {
  return (
    <X onClick={onClick} width={width} height={height} className={`cursor-pointer x-icon-btn ${className}`} />
  )
}
