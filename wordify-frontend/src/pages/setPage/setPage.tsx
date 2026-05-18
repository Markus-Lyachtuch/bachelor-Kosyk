import "./setPage.styl";
import { useAtom } from "jotai";
import { useNavigate, useParams } from "react-router-dom";

import { Title } from "shared/ui/title";
import { Button } from "shared/ui/button";
import { FetchSets } from "features/sets/fetchSets/ui";
import { setsAtom } from "features/sets/fetchSets/model/atoms";
import { foldersAtom } from "features/folder/commonAtom";
import { isCreateSetModalOpenedAtom } from "features/sets/createSet/model/atoms";
import { CreateSet } from "features/sets/createSet/ui";
import { isLoadingSetsAtom } from "features/sets/commonAtom";
import { useEffect, useState } from "react";

export const SetPage = () => {
  const nav = useNavigate();
  const { id } = useParams();
  const [, setIsCreateSetModalOpened] = useAtom(isCreateSetModalOpenedAtom);
  const [isLoadingSets] = useAtom(isLoadingSetsAtom);
  const [sets] = useAtom(setsAtom);
  const [folders] = useAtom(foldersAtom);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const foundFolder =
    (sets && sets?.length > 0 && sets[0].folder) ||
    (folders && folders.find((folder) => folder.id === +id!));

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  useEffect(() => {
    if (!foundFolder && !isLoadingSets && isPageLoaded) {
      nav("/home/folders");
    }
  }, [isLoadingSets, sets, isPageLoaded]);

  return (
    <div
      className={`flex-col search-container ${sets && sets.length === 0 && "h-full"}`}
    >
      <header className="search-header">
        <div className="flex-between-center">
          <Title variant="small">
            <span
              className="cursor-pointer"
              onClick={() => nav("/home/folders")}
            >
              Folders
            </span>{" "}
            &gt; {foundFolder ? foundFolder.name : "N/A"}
          </Title>

          <Button
            onClick={() => setIsCreateSetModalOpened(true)}
            variant="rounded"
            className="plus-btn"
          >
            <Title variant="primary">+</Title>
          </Button>
        </div>
      </header>

      {id && <FetchSets folderId={+id} />}
      {id && <CreateSet id={+id} />}
    </div>
  );
};
