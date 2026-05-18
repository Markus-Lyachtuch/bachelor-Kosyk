import "./settingItem.styl";

import { Title } from "shared/ui/title";
import { IconWrapper } from "shared/ui/iconWrapper";

import { FunctionComponent, SVGProps, useEffect, useState } from "react";
import { Switcher } from "shared/ui/switcher";

interface ISettingItem {
  title: string;
  description: string;
  isSwitcherEnabled?: boolean;
  onClick: (func?: () => void) => void;
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
}

export const SettingItem = ({ title, description, Icon, onClick, isSwitcherEnabled }: ISettingItem) => {
  const [isSettingEnabled, setIsSettingEnabled] = useState<boolean>(false);

  const handleSwitch = () => {
    setIsSettingEnabled(prev => !prev);
    onClick(() => setIsSettingEnabled(prev => !prev));
  }

  useEffect(() => {
    if (isSwitcherEnabled) {
      setIsSettingEnabled(isSwitcherEnabled);
    }
  }, [isSwitcherEnabled])

  return (
    <div className="flex-between setting-item">
      <div className="setting-item-icon-title-container">
        <IconWrapper width={20} height={20} Icon={Icon} />
        <div className="setting-item-title-description-container flex-col">
          <Title variant="small-3" fontWeight="semibold">
            {title}
          </Title>
          <p className="setting-item-description">{description}</p>
        </div>
      </div>
      <Switcher isActive={isSettingEnabled} onClick={handleSwitch} />
    </div>
  );
};
