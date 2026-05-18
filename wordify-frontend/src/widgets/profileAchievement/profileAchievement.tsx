import "./profileAchievement.styl";

import { FunctionComponent, SVGProps } from "react";
import { ProgressLine } from "shared/ui/progressLine";
import { Title } from "shared/ui/title";

interface IProfileAchievement {
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  currentProgress: number;
  expectedProgress: number;
}

export const ProfileAchievement = ({
  Icon,
  title,
  description,
  currentProgress,
  expectedProgress,
}: IProfileAchievement) => {
  const countCurrentProgressInPercentage = () =>
    (currentProgress / expectedProgress) * 100;

  return (
    <div className="profile-achievement-widget flex-y-center">
      <div className="flex-center profile-achievement-widget-icon-block">
        <Icon width={72} height={72} />
      </div>

      <div className="profile-achievement-widget-info flex-col">
        <div className="flex-between-center">
          <Title variant="small-2">{title}</Title>
          <span className="profile-achievement-widget-info-progress">
            {currentProgress}/{expectedProgress}
          </span>
        </div>

        <ProgressLine percentage={countCurrentProgressInPercentage()} />

        <div className="profile-achievement-widget-info-progress">
          {description}
        </div>
      </div>
    </div>
  );
};
