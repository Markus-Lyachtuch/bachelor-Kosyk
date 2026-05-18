import { ChangeEvent, RefObject, useRef, useState } from 'react';
import { convertFileToBase64 } from 'shared/lib/convertToBase64';
import { readImage } from 'shared/lib/readFile';

interface OnResultImageParams {
  result: FileReader["result"];
  file?: File;
}

interface IUseFile {
  onLoadedFile?: (file: File) => void;
  onResultImage?: (params: OnResultImageParams) => void;
}

export const useFile = ({ onLoadedFile, onResultImage }: IUseFile={}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [base64File, setBase64File] = useState<string | null>(null);

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const { base64 } = await convertFileToBase64(file);

      setFile(file);
      setBase64File(base64);

      if (onLoadedFile) {
        onLoadedFile(file);
      }

      if (onResultImage) {
        readImage({ file, callBack: (result) => onResultImage({ result, file }) });
      }
    }
  };

  const resetFile = (input: RefObject<HTMLInputElement | null>) => {
    setFile(null);
    setBase64File(null);

    if (input?.current) {      
      input.current.value = "";
    }
  };

  return { file, base64File, fileInputRef, onFileChange, setFile, resetFile };
};
