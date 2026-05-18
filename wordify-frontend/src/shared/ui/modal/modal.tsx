import { PropsWithChildren } from "react";
import "./modal.styl";

export interface IModal {
  className?: string;
  onClose: () => void;
  isModalShowed: boolean;
}

export const Modal = ({
  onClose,
  className="",
  isModalShowed,
  children,
}: PropsWithChildren<IModal>) => {
  return (
    <div className={`${className} modal ${isModalShowed ? "show" : "hide"}`}>
      <div
        className={`modal-window ${isModalShowed ? "modal-window-show show" : "modal-window-hide hide"}`}
      >
        {children}
      </div>
      <div className="modal-overlay" onClick={onClose}></div>
    </div>
  );
};
