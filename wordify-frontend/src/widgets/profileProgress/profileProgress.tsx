import "./profileProgress.styl";
import { Title } from "shared/ui/title";
import { FunctionComponent, SVGProps } from "react";

interface IProfileProgress {
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  title: string;
  count: number;
}

export const ProfileProgress = ({ Icon, title, count }: IProfileProgress) => {
  return (
    <div className="flex-col profile-progress flex-y-center">
      <div className="flex-x-center profile-progress-icon-container">
        <Icon />
      </div>
      <span className="profile-progress-text">{title}</span>
      <Title variant="small-2">{count}</Title>
    </div>
  );
};
