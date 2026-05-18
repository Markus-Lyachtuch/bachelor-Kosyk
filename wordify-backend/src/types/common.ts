import { Request } from "express";
import { File as MulterFile } from "multer";

export interface MulterRequest extends Request {
  file?: MulterFile;
  files?: { [fieldname: string]: MulterFile[] };
}
