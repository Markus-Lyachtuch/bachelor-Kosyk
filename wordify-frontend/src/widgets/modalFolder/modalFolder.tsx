import "./modalFolder.styl";
import { PropsWithChildren } from "react";

import { Modal } from "shared/ui/modal";
import { Title } from "shared/ui/title";
import { Button } from "shared/ui/button";
import { Loader } from "shared/ui/loader";
import { IModal } from "shared/ui/modal/modal";
import { ButtonVariant } from "shared/ui/button/button";

interface IModalBtnProps {
  text?: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

interface IModalFolder extends IModal {
  title: string;
  confirmBtnProps: IModalBtnProps;
  cancelBtnProps: IModalBtnProps;
  isLoading?: boolean;
}

export const ModalFolder = ({
  title,
  onClose,
  isModalShowed,
  children,
  confirmBtnProps,
  cancelBtnProps,
  isLoading,
}: PropsWithChildren<IModalFolder>) => {
  return (
    <Modal
      className="modal-folder-container"
      onClose={onClose}
      isModalShowed={isModalShowed}
    >
      <div className="modal-folder flex-col">
        <Title variant="small">{title}</Title>
        {children}
        <footer className={isLoading ? "flex-x-center" : "flex-x-end"}>
          <div className="modal-folder-btns-container flex-y-center">
            {isLoading ? (
              <Loader />
            ) : (
              <>
                <Button onClick={cancelBtnProps.onClick} variant="outline">
                  {cancelBtnProps.text ? cancelBtnProps.text : "Cancel"}
                </Button>
                <Button onClick={confirmBtnProps.onClick} variant={confirmBtnProps?.variant ? confirmBtnProps.variant : "primary"}>
                  {confirmBtnProps.text ? confirmBtnProps.text : "Confirm"}
                </Button>
              </>
            )}
          </div>
        </footer>
      </div>
    </Modal>
  );
};
