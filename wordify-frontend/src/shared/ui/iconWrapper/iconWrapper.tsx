import { FunctionComponent, SVGProps } from "react";
import "./iconWrapper.styl";

interface IIconWrapper extends SVGProps<SVGSVGElement> {
    Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
    iconWrapperClassName?: string;
}

export const IconWrapper = ({ Icon, iconWrapperClassName, ...props }: IIconWrapper) => {
  return (
    <div className={`icon-wrapper flex-center ${iconWrapperClassName}`}><Icon {...props} /></div>
  )
}
