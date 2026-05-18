import { fetchSets, ISet } from "features/sets/api/setsApi";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { WordSetCard } from "widgets/wordSetCard";
import { setsAtom } from "../model/atoms";
import { isLoadingSetsAtom } from "features/sets/commonAtom";
import { Loader } from "shared/ui/loader";
import { EmptyState } from "shared/ui/emptyState";
import { isCreateSetModalOpenedAtom } from "features/sets/createSet/model/atoms";

interface IFetchSetsProps {
  folderId: number;
}

export const FetchSets = ({ folderId }: IFetchSetsProps) => {
  const [,setIsCreateSetModalOpened] = useAtom(isCreateSetModalOpenedAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingSetsAtom);
  const [sets, setSets] = useAtom<ISet[] | null>(setsAtom);

  const notLoadingAndNoSets = !isLoading && sets && sets.length === 0;
  const notLoadingAndHasSets = !isLoading && sets && sets.length > 0;

  useEffect(() => {
    const getSets = async () => {
      setIsLoading(true);
      const result = await fetchSets({ folderId });
      if (result.ok && result.data) {
        setSets(result.data);
      }
      setIsLoading(false);
    };

    getSets();
  }, [folderId]);

  return (
    <>
      {isLoading && <Loader />}

      <div className="cards-list">
        {notLoadingAndNoSets && (
          <EmptyState
            description="Let's start adding your sets"
            btnText="Create set"
            onClick={() => setIsCreateSetModalOpened(true)}
          />
        )}
        {notLoadingAndHasSets &&
          sets.map((set) => <WordSetCard key={set.id} setInfo={set} index={set.id} />)}
      </div>
    </>
  );
};
