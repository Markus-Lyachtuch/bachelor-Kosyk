import mammoth from "mammoth";

export async function readTextFromBrowserFile(file: File) {
  const fileType = file.name.split(".").pop()!.toLowerCase();

  try {
    if (fileType === "txt") {
      return await readFileAsText(file);
    }

    if (fileType === "docx") {
      const arrayBuffer = (await readFileAsArrayBuffer(file)) as ArrayBuffer;
      const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      return result.value;
    }

    throw new Error("Unsupported file type. Only .txt and .docx are allowed.");
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}

function readFileAsText(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function readFileAsArrayBuffer(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export interface ReadImageParams {
  file: File,
  callBack: (result: FileReader["result"]) => void,
}

export function readImage({ file, callBack }: ReadImageParams) {
  const reader = new FileReader();
  reader.onload = function (e) {
    if (e.target) {
      callBack(e.target.result);
    }
  };
  reader.readAsDataURL(file);
}
