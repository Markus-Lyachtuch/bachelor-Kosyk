import "./studyWrite.styl";
import { LearningStatus } from "features/sets/api/setsApi";
import { useAtom } from "jotai";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";
import { useState } from "react";
import { StudySetHeader } from "widgets/studySetHeader";
import { Input } from "shared/ui/input";
import { useNavigate } from "react-router-dom";
import {
  missedWordsAndTheirCountAtom,
  setWordInfoMissed,
} from "features/sets/studySetResults/model/atoms";

interface IStudyCheckPronunciation {
  goToWord: (nextIndex: number, status: LearningStatus) => void;
  wordIndexNumberExist: boolean | number;
  wordIndexNumber: number | null;
  percentageProgress: number;
}

export const StudyWrite = ({
  goToWord,
  wordIndexNumber,
  percentageProgress,
  wordIndexNumberExist,
}: IStudyCheckPronunciation) => {
  const nav = useNavigate();
  const [fullSetInfo] = useAtom(fullInfoSetAtom);
  const [error, setError] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [, setMissedWordsAndTheirCount] = useAtom(missedWordsAndTheirCountAtom);

  const correctTerm =
    wordIndexNumberExist && fullSetInfo?.words[wordIndexNumber!]?.term;
  const termImage = fullSetInfo?.words[wordIndexNumber!]?.image;
  const definition =
    wordIndexNumberExist && fullSetInfo?.words[wordIndexNumber!]?.definition;

  const isStudyWriteMode =
    wordIndexNumberExist &&
    (fullSetInfo?.words[wordIndexNumber!]?.status === LearningStatus.WRITE ||
      fullSetInfo?.words[wordIndexNumber!]?.status === LearningStatus.LEARNED);

  const resetInput = () => {
    setUserAnswer("");
    setError("");
  };

  const checkAndNavigateToResultsWriteMode = () => {
    if (fullSetInfo && wordIndexNumber === fullSetInfo?.words.length - 1) {
      nav(
        `/home/folders/${fullSetInfo?.folderId}/sets/${fullSetInfo?.id}/study/results`,
      );
      return;
    }
  };

  const handleNextClick = () => {
    if (!userAnswer.trim() || !correctTerm) return;

    if (error && correctTerm.toLowerCase() === userAnswer.trim().toLowerCase()) {
      checkAndNavigateToResultsWriteMode();
      goToWord(wordIndexNumber! + 1, LearningStatus.VARIANTS);
      resetInput();
    } else if (correctTerm.toLowerCase() === userAnswer.trim().toLowerCase()) {
      checkAndNavigateToResultsWriteMode();
      goToWord(wordIndexNumber! + 1, LearningStatus.LEARNED);
      resetInput();
    } else {
      setError(`The correct term is ${correctTerm}.`);
      setMissedWordsAndTheirCount((prev) =>
        setWordInfoMissed(prev, correctTerm as string),
      );
    }
  };

  return (
    <>
      {isStudyWriteMode && (
        <div className="flex-col study-set-page-write-mode-container">
          <StudySetHeader
            wordIndexNumber={wordIndexNumber}
            percentageProgress={percentageProgress}
            questionsLength={fullSetInfo?.words.length}
            handleNextClick={handleNextClick}
            userAnswer={userAnswer}
          />

          <div className="study-set-page-write-mode-wrapper">
            <div className="study-set-page-write-mode">
              <div className="flex-col study-set-page-write-mode-block">
                <span>Definition</span>
                <p className="no-scrollbar flex-col study-set-page-write-mode-block-definition">
                  {definition}
                </p>
              </div>

              {termImage && (
                <img src={termImage} alt={`${correctTerm}-picture-term`} />
              )}
            </div>

            <Input
              value={userAnswer}
              onKeyDown={(e) => e.key === "Enter" && handleNextClick()}
              onChange={(e) => setUserAnswer(e.target.value)}
              error={error}
              variant="study"
              placeholder="Type the answer"
              className="w-full"
            />
          </div>
        </div>
      )}
    </>
  );
};
