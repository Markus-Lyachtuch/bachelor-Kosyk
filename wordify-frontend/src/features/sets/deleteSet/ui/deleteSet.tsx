import { useAtom } from "jotai";
import { useState } from "react";
import { ModalFolder } from "widgets/modalFolder";
import { isDeleteModalSetShowedAtom } from "../model/atoms";
import { deleteSet } from "features/sets/api/setsApi";
import { useNavigate } from "react-router-dom";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";

export const DeleteSet = () => {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fullSetInfo] = useAtom(fullInfoSetAtom);
  const [isDeleteModalShowed, setIsDeleteModalShowed] = useAtom(
    isDeleteModalSetShowedAtom,
  );

  const handleDeleteSet = async () => {
    if (!fullSetInfo?.id) return;
    setIsLoading(true);
    const result = await deleteSet({
      setId: fullSetInfo?.id || 0,
      loaderFinally: () => {
        setIsLoading(false);
        setIsDeleteModalShowed(false);
      },
    });

    if (result.ok) {
      nav(`/home/folders/${fullSetInfo?.folderId}`);
    }
  };

  return (
    <ModalFolder
      onClose={() => setIsDeleteModalShowed(false)}
      isModalShowed={isDeleteModalShowed}
      title="Delete Set"
      isLoading={isLoading}
      confirmBtnProps={{
        onClick: handleDeleteSet,
        text: "Delete",
        variant: "danger",
      }}
      cancelBtnProps={{
        onClick: () => setIsDeleteModalShowed(false),
        text: "Cancel",
      }}
    >
      Are you sure you want to delete "{fullSetInfo?.name}" set?
    </ModalFolder>
  );
};
