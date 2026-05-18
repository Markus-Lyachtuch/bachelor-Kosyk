import "./studyVariantsSet.styl";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";

import { LearningStatus } from "features/sets/api/setsApi";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";

import { Button } from "shared/ui/button";
import { StudySetHeader } from "widgets/studySetHeader";
import {
  missedWordsAndTheirCountAtom,
  setWordInfoMissed,
} from "features/sets/studySetResults/model/atoms";

interface IStudyVariantsSet {
  goToWord: (nextIndex: number, status: LearningStatus) => void;
  wordIndexNumberExist: boolean | number;
  wordIndexNumber?: number | null;
  percentageProgress: number;
}

export const StudyVariantsSet = ({
  wordIndexNumberExist,
  percentageProgress,
  wordIndexNumber,
  goToWord,
}: IStudyVariantsSet) => {
  const [fullSetInfo] = useAtom(fullInfoSetAtom);
  const [randomGeneratedVariants, setRandomGeneratedVariants] = useState<
    number[]
  >([]);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [nextStatusForCurrentWord, setNextStatusForCurrentWord] =
    useState<LearningStatus>(LearningStatus.CHECK_PRONUNCIATION);
  const [, setMissedWordsCount] = useAtom(missedWordsAndTheirCountAtom);

  const isStudyVariants =
    wordIndexNumberExist &&
    fullSetInfo?.words[wordIndexNumber!]?.status === LearningStatus.VARIANTS;

  const term =
    wordIndexNumberExist && fullSetInfo?.words[wordIndexNumber!]?.term;

  const handleNextClick = () => {
    if (userAnswer === null) return;
    setUserAnswer(null);
    goToWord(wordIndexNumber! + 1, nextStatusForCurrentWord);
  };

  const handleAnswerClick = (index: number) => {
    setUserAnswer(index);

    if (index !== wordIndexNumber) {
      setNextStatusForCurrentWord(LearningStatus.FLASH_CARD);
      setMissedWordsCount((prev) => setWordInfoMissed(prev, term as string));
    } else {
      setNextStatusForCurrentWord(LearningStatus.CHECK_PRONUNCIATION);
    }
  };

  const showVariant = (generatedIndex: number) => {
    if (
      (userAnswer === wordIndexNumber && generatedIndex === wordIndexNumber) ||
      (userAnswer !== null && generatedIndex === wordIndexNumber)
    ) {
      return "outline-correct";
    } else if (
      userAnswer !== null &&
      userAnswer !== wordIndexNumber &&
      generatedIndex !== wordIndexNumber
    ) {
      return "outline-incorrect";
    } else {
      return "outline";
    }
  };

  useEffect(() => {
    if (
      !fullSetInfo ||
      wordIndexNumber === null ||
      wordIndexNumber === undefined
    ) {
      setRandomGeneratedVariants([]);
      return;
    }

    const wordsLength = fullSetInfo.words.length;
    if (!wordsLength) {
      setRandomGeneratedVariants([]);
      return;
    }

    const maxOptions = Math.min(4, wordsLength);
    const indices = [wordIndexNumber];

    while (indices.length < maxOptions) {
      const randomIndex = Math.floor(Math.random() * wordsLength);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }

    indices.sort(() => Math.random() - 0.5);
    setRandomGeneratedVariants(indices);
  }, [fullSetInfo, wordIndexNumber]);

  useEffect(() => {
    setUserAnswer(null);
    setNextStatusForCurrentWord(LearningStatus.CHECK_PRONUNCIATION);
  }, [wordIndexNumber]);

  return (
    <>
      {isStudyVariants && (
        <div className="study-page-variants flex-col">
          <StudySetHeader
            wordIndexNumber={wordIndexNumber}
            percentageProgress={percentageProgress}
            questionsLength={fullSetInfo?.words.length}
            handleNextClick={handleNextClick}
            userAnswer={userAnswer}
          />
          <div className="flex-col study-page-variants-card">
            <span>Definition</span>
            <div className="flex-col study-page-variants-card-info-container">
              <div className="flex-between-center study-page-variants-card-info">
                <p className="no-scrollbar">
                  {fullSetInfo?.words[wordIndexNumber!]?.definition}
                </p>
                {fullSetInfo?.words[wordIndexNumber!]?.image && (
                  <img
                    className="study-page-variants-card-info-image"
                    src={fullSetInfo?.words[wordIndexNumber!].image!}
                    alt="definition"
                  />
                )}
              </div>

              <div className="study-page-variants-card-btns-container">
                {randomGeneratedVariants.length > 0 &&
                  randomGeneratedVariants.map((generatedIndex) => (
                    <Button
                      onClick={() =>
                        userAnswer === null && handleAnswerClick(generatedIndex)
                      }
                      variant={showVariant(generatedIndex)}
                      key={generatedIndex}
                    >
                      {fullSetInfo?.words[generatedIndex]?.term}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
