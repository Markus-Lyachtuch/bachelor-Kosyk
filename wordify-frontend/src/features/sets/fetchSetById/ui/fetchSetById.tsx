import { useAtom } from "jotai";
import { useParams } from "react-router-dom";
import { PropsWithChildren, useEffect } from "react";

import { fetchSetById } from "features/sets/api/setsApi";
import { fullInfoSetAtom } from "../model/atoms";
import { isLoadingSetsAtom } from "features/sets/commonAtom";
import { Loader } from "shared/ui/loader";

export const FetchSetById = ({ children }: PropsWithChildren) => {
  const { setId } = useParams();
  const [isLoading, setIsLoading] = useAtom(isLoadingSetsAtom);
  const [, setFullSetInfo] = useAtom(fullInfoSetAtom);

  useEffect(() => {
    const getSetById = async () => {
      setIsLoading(true);
      const result = await fetchSetById({ setId: setId ? +setId : 0 });

      if (result.ok && result.data) {
        setFullSetInfo(result.data);
      }
      setIsLoading(false);
    };

    getSetById();
  }, [setId]);

  return <>{isLoading ? <Loader /> : children}</>;
};
