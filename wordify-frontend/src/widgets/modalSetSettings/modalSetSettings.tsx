import "./modalSetSettings.styl";
import { PropsWithChildren } from "react";

import { Modal } from "shared/ui/modal";
import { Title } from "shared/ui/title";

import X from "shared/assets/icons/x.svg?react"
import Settings from "shared/assets/icons/settings.svg?react"
import { IconWrapper } from "shared/ui/iconWrapper";

interface IModalSetSettings {
  title: string;
  onClose: () => void;
  isModalShowed: boolean;
}

export const ModalSetSettings = ({
  onClose,
  isModalShowed,
  title,
  children,
}: PropsWithChildren<IModalSetSettings>) => {
  return (
    <Modal
      className="modal-set-settings-container"
      onClose={onClose}
      isModalShowed={isModalShowed}
    >
      <div className="modal-set-settings flex-col">
        <header className="flex-between-center">
          <div className="modal-set-settings-icon-and-title flex-y-center">
            <IconWrapper Icon={Settings} />
            <Title variant="small-2" fontWeight="semibold">{title}</Title>
          </div>

          <div className="modal-set-settings-icon-wrapper cursor-pointer"><X onClick={onClose} width={20} height={20} /></div>
        </header>
        {children}
      </div>
    </Modal>
  );
};
