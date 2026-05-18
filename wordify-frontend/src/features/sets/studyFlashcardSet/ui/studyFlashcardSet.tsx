import "./studyFlashcardSet.styl";

import { useAtom } from "jotai";
import { useState } from "react";
import ReactCardFlip from "react-card-flip";
import { useSearchParams } from "react-router-dom";

import { LearningStatus } from "../../api/setsApi";
import { fullInfoSetAtom } from "../../fetchSetById/model/atoms";

import { Title } from "shared/ui/title";
import { Button } from "shared/ui/button";
import { LevelBadge } from "shared/ui/levelBadge";

import X from "shared/assets/icons/x.svg?react";
import Check from "shared/assets/icons/check.svg?react";
import { missedWordsAndTheirCountAtom, setWordInfoMissed } from "features/sets/studySetResults/model/atoms";

interface IStudyFlashcardSetProps {
  wordImage?: string | null;
  wordIndexNumber: number | null;
  wordIndexNumberExist: boolean | number;
  goToWord: (nextIndex: number, status: LearningStatus) => void;
}

export const StudyFlashcardSet = ({
  wordIndexNumber,
  wordIndexNumberExist,
  wordImage,
  goToWord,
}: IStudyFlashcardSetProps) => {
  const [, setSearchParams] = useSearchParams();
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [fullSetInfo, setFullSetInfo] = useAtom(fullInfoSetAtom);
  const [, setMissedWordsAndTheirCount] = useAtom(missedWordsAndTheirCountAtom);

  const term = fullSetInfo?.words[wordIndexNumber!]?.term;
  const wordLevel = fullSetInfo?.words[wordIndexNumber!]?.word?.level;
  const wordSource = fullSetInfo?.words[wordIndexNumber!]?.word?.source;  

  const dontKnowWord = (index: number) => {
    setFullSetInfo((prev) => {
      if (!prev || !prev.words[index]) return prev;

      const copied = structuredClone(prev);
      const { words } = copied;
      const wordsLength = words.length;

      if (wordsLength <= 1 || index === wordsLength - 1) {
        return copied;
      }

      const [item] = words.splice(index, 1);
      words.push(item);

      return copied;
    });

    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("wordIndex", String(index));
      return params;
    });

    setMissedWordsAndTheirCount((prev) => setWordInfoMissed(prev, term as string))
  };

  return (
    <>
      {wordIndexNumberExist &&
        fullSetInfo?.words[wordIndexNumber!]?.status ===
          LearningStatus.FLASH_CARD && (
          <div className="flex-col study-set-page-flashcard-container">
            <ReactCardFlip isFlipped={isCardFlipped} flipDirection="horizontal">
              <div
                onClick={() => setIsCardFlipped((prev) => !prev)}
                className="relative study-set-page-flashcard flex-center"
              >
                {wordLevel && (
                  <div className="flex-y-center study-set-page-flashcard-level-badge">
                    <span className="study-set-page-flashcard-level-badge-trusted">
                      Trusted by {wordSource}
                    </span>
                    <LevelBadge>{wordLevel?.level}</LevelBadge>
                  </div>
                )}
                <Title variant="small">
                  {wordIndexNumberExist
                    ? term
                    : "N/A"}
                </Title>
              </div>

              <div
                onClick={() => setIsCardFlipped((prev) => !prev)}
                className="study-set-page-flashcard flex-center"
              >
                <p className="no-scrollbar study-set-page-flashcard-definition">
                  {wordIndexNumberExist &&
                    fullSetInfo?.words[wordIndexNumber!]?.definition}
                </p>
                {wordIndexNumberExist && wordImage && (
                  <img
                    className="study-set-page-flashcard-img"
                    src={wordImage}
                    alt="Flashcard image"
                  />
                )}
              </div>
            </ReactCardFlip>

            <div className="flex-between-center w-full study-set-page-flashcard-btns">
              <Button
                onClick={() =>
                  wordIndexNumberExist && dontKnowWord(wordIndexNumber!)
                }
                className="flex-center"
                variant="rounded"
              >
                <X width={24} height={24} fill="var(--white)" />
              </Button>
              <Title variant="small-2">
                <b>
                  {wordIndexNumberExist && wordIndexNumber! + 1} /{" "}
                  {fullSetInfo?.words.length}
                </b>
              </Title>
              <Button
                onClick={() =>
                  wordIndexNumberExist && goToWord(wordIndexNumber! + 1, LearningStatus.VARIANTS)
                }
                className="flex-center"
                variant="rounded"
              >
                <Check width={24} height={24} />
              </Button>
            </div>
          </div>
        )}
    </>
  );
};
