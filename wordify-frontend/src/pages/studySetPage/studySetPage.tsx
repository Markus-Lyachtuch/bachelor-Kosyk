import "./studySetPage.styl";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { showNegativeToast } from "shared/lib/toastify";

import { LearningStatus } from "features/sets/api/setsApi";
import { FetchSetById } from "features/sets/fetchSetById/ui";
import { changeStatusWord } from "features/sets/api/userWordApi";
import { StudyVariantsSet } from "features/sets/studyVariantsSet/ui";
import { StudyFlashcardSet } from "features/sets/studyFlashcardSet/ui";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";
import { StudyCheckPronunciation } from "features/sets/studyCheckPronunciation/ui";
import {
  StudyOption,
  usersChoiceStudyOptionAtom,
} from "features/sets/studyVariantsSet/model/atoms";
import { StudyWrite } from "features/sets/studyWrite/ui";
import { StudyWithAi } from "features/sets/studyWithAi/ui";

export const StudySet = () => {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [fullSetInfo, setFullSetInfo] = useAtom(fullInfoSetAtom);
  const [usersChoiceStudyOption] = useAtom(usersChoiceStudyOptionAtom);

  const wordIndex = searchParams.get("wordIndex");

  const wordIndexNumber = wordIndex || wordIndex === "0" ? +wordIndex : null;
  const wordIndexNumberExist = wordIndexNumber || wordIndexNumber === 0;
  const wordImage =
    wordIndexNumber !== null
      ? fullSetInfo?.words[wordIndexNumber]?.image
      : null;

  const showableStatusesForStudyMode = new Set<LearningStatus>([
    LearningStatus.FLASH_CARD,
    LearningStatus.VARIANTS,
    LearningStatus.CHECK_PRONUNCIATION,
  ]);

  const showableStatusesForWriteMode = new Set<LearningStatus>([
    LearningStatus.WRITE,
    LearningStatus.LEARNED,
  ]);

  const percentageProgress =
    ((wordIndexNumber! + 1) / fullSetInfo?.words.length!) * 100;

  const getFirstShowableWordIndex = (setStatuses: Set<LearningStatus>) => {
    if (!fullSetInfo) return -1;

    return (
      fullSetInfo.words.findIndex((word) => setStatuses.has(word.status)) ?? -1
    );
  };

  const handleChangeStatusWord = async (status: LearningStatus) => {
    if (!fullSetInfo || !fullSetInfo.words[wordIndexNumber!]) return;

    const { ok } = await changeStatusWord({
      wordId: String(fullSetInfo?.words[wordIndexNumber!]?.id),
      status,
    });

    if (ok) {
      setFullSetInfo((prev) => {
        if (!prev) return prev;
        const copied = structuredClone(prev);
        copied.words[wordIndexNumber!].status = status;
        return copied;
      });
    }
  };

  const goToWord = async (nextIndex: number, status: LearningStatus) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (nextIndex === fullSetInfo?.words.length) {
        params.set("wordIndex", "0");
      } else {
        params.set("wordIndex", String(nextIndex));
      }
      return params;
    });

    await handleChangeStatusWord(status);
  };

  const goToFirstShowableWordIndex = (setStatuses: Set<LearningStatus>) => {
    const firstShowableIndex = getFirstShowableWordIndex(setStatuses);
    if (firstShowableIndex === -1) {
      nav(
        `/home/folders/${fullSetInfo?.folderId}/sets/${fullSetInfo?.id}/study/results`,
      );
      return;
    }

    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("wordIndex", String(firstShowableIndex));
      return params;
    });
  };

  useEffect(() => {
    if (
      (usersChoiceStudyOption !== StudyOption.LEARN_WITH_AI &&
        !wordIndexNumber &&
        wordIndexNumber !== 0) ||
      (isNaN(wordIndexNumber!) &&
        usersChoiceStudyOption !== StudyOption.LEARN_WITH_AI) ||
      !usersChoiceStudyOption
    ) {
      showNegativeToast("Invalid word index");
      nav(`/home/folders`);
      return;
    }

    if (
      usersChoiceStudyOption !== StudyOption.LEARN_WITH_AI &&
      fullSetInfo &&
      !fullSetInfo.words[wordIndexNumber!]
    ) {
      showNegativeToast("Word index out of range");
      nav(`/home/folders/${fullSetInfo?.folderId}/sets/${fullSetInfo?.id}`);
      return;
    }

    if (!fullSetInfo) return;

    const currentStatus = fullSetInfo.words[wordIndexNumber!]?.status;

    if (
      !showableStatusesForStudyMode.has(currentStatus) &&
      usersChoiceStudyOption === StudyOption.STUDY
    ) {
      goToFirstShowableWordIndex(showableStatusesForStudyMode);
    } else if (
      !showableStatusesForWriteMode.has(currentStatus) &&
      usersChoiceStudyOption === StudyOption.WRITE
    ) {
      goToFirstShowableWordIndex(showableStatusesForWriteMode);
    }
  }, [wordIndexNumber, fullSetInfo, usersChoiceStudyOption]);

  return (
    <section className="study-set-page flex-x-center">
      <FetchSetById>
        {usersChoiceStudyOption === StudyOption.STUDY && (
          <>
            <StudyFlashcardSet
              goToWord={goToWord}
              wordImage={wordImage}
              wordIndexNumber={wordIndexNumber}
              wordIndexNumberExist={wordIndexNumberExist}
            />
            <StudyVariantsSet
              goToWord={goToWord}
              wordIndexNumber={wordIndexNumber}
              percentageProgress={percentageProgress}
              wordIndexNumberExist={wordIndexNumberExist}
            />
            <StudyCheckPronunciation
              goToWord={goToWord}
              wordIndexNumber={wordIndexNumber}
              percentageProgress={percentageProgress}
              wordIndexNumberExist={wordIndexNumberExist}
            />
          </>
        )}
        {usersChoiceStudyOption === StudyOption.WRITE && (
          <StudyWrite
            goToWord={goToWord}
            wordIndexNumber={wordIndexNumber}
            percentageProgress={percentageProgress}
            wordIndexNumberExist={wordIndexNumberExist}
          />
        )}
        {usersChoiceStudyOption === StudyOption.LEARN_WITH_AI && (
          <StudyWithAi />
        )}
      </FetchSetById>
    </section>
  );
};
