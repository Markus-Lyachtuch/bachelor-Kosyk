import "./modalSet.styl";
import { Modal } from "shared/ui/modal";
import { Title } from "shared/ui/title";
import { PropsWithChildren } from "react";
import { XIconBtn } from "shared/ui/xIconBtn";

interface IModalSet {
  isOpened: boolean;
  onClose: () => void;
  title: string;
}

export const ModalSet = ({
  isOpened,
  onClose,
  title,
  children,
}: PropsWithChildren<IModalSet>) => {
  return (
    <Modal className="modal-set" isModalShowed={isOpened} onClose={onClose}>
      <div className="flex-between-center">
        <Title variant="small">{title}</Title>
        <XIconBtn className="cursor-pointer" width={24} height={24} onClick={onClose} />
      </div>
      {children}
    </Modal>
  );
};
