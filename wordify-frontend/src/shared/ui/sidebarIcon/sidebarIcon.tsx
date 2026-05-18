import { FunctionComponent, SVGProps, useState } from "react";
import { NavLink } from "react-router-dom";

import "./sidebarIcon.styl";

interface SidebarIconProps {
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  title?: string;
  to: string;
  onClick : (index: number) => void;
  index: number;
}

export default function SidebarIcon({ Icon, title, to, onClick, index }: SidebarIconProps) {
  const [isIconHovered, setIsIconHovered] = useState(false);

  return (
    <NavLink onClick={() => onClick(index)} to={to} className="sidebar-icon">
      <Icon
        fill={isIconHovered ? "var(--primary)" : "var(--black)"}
        onMouseEnter={() => setIsIconHovered(true)}
        onMouseLeave={() => setIsIconHovered(false)}
      />

      <span className="sidebar-title">{title}</span>
    </NavLink>
  );
}
