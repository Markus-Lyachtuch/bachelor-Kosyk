import { ApiParamsFNs, apiPatch } from "shared/api/base";
import { LearningStatus } from "./setsApi";

interface IChangeStatusWordParams extends ApiParamsFNs {
  wordId: string;
  status: LearningStatus;
}

export const changeStatusWord = async ({
  wordId,
  status,
  loaderFNNegative,
  loaderFNPositive,
}: IChangeStatusWordParams) => {
  return await apiPatch({
    url: `/user-word/status/${wordId}`,
    payload: { status },
    loaderFNNegative,
    loaderFNPositive,
  });
};
