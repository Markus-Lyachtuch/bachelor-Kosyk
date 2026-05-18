const guessMimeFromFilename = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "txt":
      return "text/plain";
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    default:
      return "application/octet-stream";
  }
};

export const base64ToFile = (base64String: string, filename: string): File => {
  const arr = base64String.split(",");
  const base64Data = arr.length > 1 ? arr[1] : arr[0];

  const cleanBase64 = base64Data.replace(/[\s\r\n]/g, "");
  const padding = "=".repeat((4 - (cleanBase64.length % 4)) % 4);
  const fixedBase64 = cleanBase64 + padding;

  const byteString = atob(fixedBase64);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  const fromDataUrl = base64String.match(/data:(.*);base64/)?.[1];
  const finalType = fromDataUrl ?? guessMimeFromFilename(filename);

  return new File([byteArray], filename, { type: finalType });
};
