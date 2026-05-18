import { fetchFolders, IFolder } from "features/folder/api/folderApi";
import { FolderFormData } from "features/folder/common";
import {
  foldersAtom,
  isFolderLoadingAtom,
  selectedFolderAtom,
} from "features/folder/commonAtom";
import { isCreateFolderModalOpenAtom } from "features/folder/createFolder/model/atoms";
import { isDeleteFolderModalOpenAtom } from "features/folder/deleteFolder/model/atoms";
import { isEditFolderModalOpenAtom } from "features/folder/editFolder/model/atoms";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "shared/ui/emptyState";
import { Loader } from "shared/ui/loader";
import { Folder } from "widgets/folder";

interface IFetchFolders {
  setEditValue: UseFormSetValue<FolderFormData>;
}

export const FetchFolders = ({ setEditValue }: IFetchFolders) => {
  const nav = useNavigate();
  const [folders, setFolders] = useAtom(foldersAtom);
  const [, setSelectedFolder] = useAtom(selectedFolderAtom);
  const [isLoading, setIsLoading] = useAtom(isFolderLoadingAtom);
  const [, setIsShowAddModal] = useAtom(isCreateFolderModalOpenAtom);
  const [, setIsEditModalShowed] = useAtom(isEditFolderModalOpenAtom);
  const [, setIsDeleteModalShowed] = useAtom(isDeleteFolderModalOpenAtom);

  const showAddModal = () => setIsShowAddModal(true);
  const handleDeleteClick = (folder: IFolder) => {
    setSelectedFolder(folder);
    setIsDeleteModalShowed(true);
  };

  const handleEditBtnClick = (folder: IFolder) => {
    setEditValue("name", folder.name);
    setIsEditModalShowed(true);
    setSelectedFolder(folder);
  };

  useEffect(() => {
    const loadFolders = async () => {
      const result = await fetchFolders();
      if (result.ok) {
        setFolders(result.data);
      }
      setIsLoading(false);
    };

    if (!folders || folders.length === 0) {
      setIsLoading(true);
      loadFolders();
    }
  }, []);

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && folders && folders?.length === 0 && (
        <EmptyState
          description="Let's start adding your folder"
          onClick={showAddModal}
          btnText="Create folder"
        />
      )}

      {!isLoading && folders && folders?.length > 0 && (
        <div className="folders-page-container">
          {folders.map((folder) => (
            <Folder
              key={folder.id}
              title={folder.name}
              editClick={() => handleEditBtnClick(folder)}
              deleteClick={() => handleDeleteClick(folder)}
              onDoubleClick={() => nav(`/home/folders/${folder.id}`)}
            />
          ))}
        </div>
      )}
    </>
  );
};
