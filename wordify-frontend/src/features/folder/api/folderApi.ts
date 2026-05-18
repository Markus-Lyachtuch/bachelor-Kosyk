import { apiDelete, apiGet, ApiParamsFNs, apiPatch, apiPost } from "shared/api/base";

export interface IFolder {
  id: number;
  name: string;
}

export const fetchFolders = async ({ loaderFNNegative, loaderFNPositive, loaderFinally }: ApiParamsFNs = {}) => {
  return await apiGet<IFolder[]>({ url: "/folders", loaderFNNegative, loaderFNPositive, loaderFinally });
};

export const createFolder = async (name: string) => {
  return await apiPost<IFolder>({ url: `/folders`, payload: { name } });
};

export const editFolder = async (id: number, name: string) => {
  return await apiPatch<IFolder>({ url: `/folders/${id}`, payload: { name, id } });
};

export const deleteFolder = async (id: number) => {
  return await apiDelete({ url: `/folders/${id}` });
}
