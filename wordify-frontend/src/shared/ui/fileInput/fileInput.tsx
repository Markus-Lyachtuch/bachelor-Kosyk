import "./fileInput.styl";
import { CSSProperties, DragEvent, FC, HTMLProps } from "react";

interface FileInputProps extends HTMLProps<HTMLInputElement> {
  error?: string;
  labelId?: string;
  labelClassName?: string;
  labelStyle?: CSSProperties;
  resetDefaultStyles?: boolean;
  labelOnDrop?: (e: DragEvent<HTMLLabelElement>) => void;
  labelOnDragOver?: (e: DragEvent<HTMLLabelElement>) => void;
  labelOnDragLeave?: (e: DragEvent<HTMLLabelElement>) => void;
}

export const FileInput: FC<FileInputProps> = ({
  labelOnDragLeave,
  labelOnDragOver,
  labelOnDrop,
  labelId,
  error,
  id,
  resetDefaultStyles,
  labelClassName,
  children,
  labelStyle,
  ref,
  ...props
}) => {
  return (
    <div className="flex-col file-input-error-wrapper">
      <label
        htmlFor={id}
        id={labelId}
        style={labelStyle}
        onDrop={labelOnDrop}
        className={`file-input-label ${labelClassName} ${resetDefaultStyles && "file-input-label-reset"}`}
        onDragOver={labelOnDragOver}
        onDragLeave={labelOnDragLeave}
      >
        {children}
      </label>
      <input hidden id={id} ref={ref} {...props} />
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
};
