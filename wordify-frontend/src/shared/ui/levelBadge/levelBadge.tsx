import "./levelBadge.styl";
import { PropsWithChildren } from "react";

export const LevelBadge = ({ children }: PropsWithChildren) => {
  return <span className="flex-center level-badge">{children}</span>;
};
