import "./foldersPage.styl";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Title } from "shared/ui/title";
import { Button } from "shared/ui/button";

import { CreateFolder } from "features/folder/createFolder/ui";
import { folderSchema } from "features/folder/common";
import { foldersAtom } from "features/folder/commonAtom";
import { EditFolder } from "features/folder/editFolder/ui";
import { DeleteFolder } from "features/folder/deleteFolder/ui";
import { FetchFolders } from "features/folder/fetchFolders/ui";
import { isCreateFolderModalOpenAtom } from "features/folder/createFolder/model/atoms";

export const FoldersPage = () => {
  const [folders] = useAtom(foldersAtom);
  const [, setIsShowAddModal] = useAtom(isCreateFolderModalOpenAtom);

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    setValue: setEditValue,
  } = useForm({ resolver: zodResolver(folderSchema) });

  const showAddModal = () => setIsShowAddModal(true);

  return (
    <div
      className={`folders-page ${folders && folders.length === 0 && "h-full"}`}
    >
      <div className="flex-between-center">
        <Title variant="primary">Folders</Title>
        <Button onClick={showAddModal} variant="rounded" className="plus-btn">
          <Title variant="primary">+</Title>
        </Button>
      </div>

      <FetchFolders setEditValue={setEditValue} />
      <CreateFolder />
      <DeleteFolder />
      <EditFolder
        errorsEdit={errorsEdit}
        registerEdit={registerEdit}
        handleSubmitEdit={handleSubmitEdit}
      />
    </div>
  );
};
