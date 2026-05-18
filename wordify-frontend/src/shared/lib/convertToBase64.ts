export const convertFileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;

      const match = base64String.match(/^data:(.+);base64,(.*)$/);
      if (match) {
        resolve({ base64: match[2], mimeType: match[1] });
      } else {
        reject(new Error('Invalid Base64 format'));
      }
    };
    reader.onerror = error => reject(error);
  });
};
