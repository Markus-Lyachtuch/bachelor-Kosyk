import "./studyCheckPronunciation.styl";

import { useAtom } from "jotai";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";
import { LearningStatus } from "features/sets/api/setsApi";

import { StudySetHeader } from "widgets/studySetHeader";
import { Title } from "shared/ui/title";
import { CheckPronunciation, PlaySound } from "features/study/words/ui";
import { useEffect, useState } from "react";

interface IStudyCheckPronunciation {
  goToWord: (nextIndex: number, status: LearningStatus) => void;
  wordIndexNumberExist: boolean | number;
  wordIndexNumber: number | null;
  percentageProgress: number;
}

export const StudyCheckPronunciation = ({
  wordIndexNumber,
  wordIndexNumberExist,
  percentageProgress,
  goToWord,
}: IStudyCheckPronunciation) => {
  const [fullSetInfo] = useAtom(fullInfoSetAtom);
  const [selectedPhoneticIndex, setSelectedPhoneticIndex] = useState<
    number | null
  >(null);
  const [checkedPronunciationResult, setCheckedPronunciationResult] = useState<
    number | null
  >(null);
  const [isPronunciationResultReset, setIsPronunciationResultReset] = useState<boolean>(false);

  const isStudyCheckPronunciation =
    wordIndexNumberExist &&
    fullSetInfo?.words[wordIndexNumber!]?.status ===
    LearningStatus.CHECK_PRONUNCIATION;

  const targetWord = fullSetInfo
    ? fullSetInfo.words[wordIndexNumber!]?.term
    : "";

  const targetPhonetic =
    fullSetInfo && fullSetInfo.words[wordIndexNumber!]?.word
      ? fullSetInfo.words[wordIndexNumber!].word.phonetics[
        selectedPhoneticIndex ?? 0
      ]?.text
      : "";

  const handleCheckPronunciation = (result: number) => {
    setCheckedPronunciationResult(result);
  };

  const handleNextClick = () => {
    if (checkedPronunciationResult === null || checkedPronunciationResult < 25)
      return;
    setCheckedPronunciationResult(null);
    setSelectedPhoneticIndex(null);
    goToWord(wordIndexNumber! + 1, LearningStatus.WRITE);
    setIsPronunciationResultReset(true);
  };

  useEffect(() => {
    if (fullSetInfo && !targetPhonetic) {
      goToWord(wordIndexNumber! + 1, LearningStatus.WRITE);
    }
  }, [fullSetInfo]);

  return (
    <>
      {isStudyCheckPronunciation && (
        <div className="study-set-page-check-pronunciation flex-col">
          <StudySetHeader
            percentageProgress={percentageProgress}
            wordIndexNumber={wordIndexNumber}
            handleNextClick={handleNextClick}
            userAnswer={checkedPronunciationResult}
            questionsLength={fullSetInfo?.words.length}
          />

          <div className="study-page-pronunciation-practice-block flex-center flex-col">
            <Title>{fullSetInfo.words[wordIndexNumber!].term}</Title>
            <div className="flex-y-center study-page-pronunciation-block">
              {fullSetInfo.words[wordIndexNumber!].word &&
                fullSetInfo.words[wordIndexNumber!].word.phonetics &&
                fullSetInfo.words[wordIndexNumber!].word.phonetics.map(
                  (phonetic, phoneticIndex) => (
                    <PlaySound
                      key={phonetic.id}
                      {...phonetic}
                      phoneticIndex={phoneticIndex}
                      onClickSound={() =>
                        setSelectedPhoneticIndex(phoneticIndex)
                      }
                      width={16}
                      height={16}
                    />
                  ),
                )}
            </div>
            <CheckPronunciation
              targetWord={targetWord}
              targetPhonetic={targetPhonetic}
              onCheckPronunciation={handleCheckPronunciation}
              isPronunciationResultReset={isPronunciationResultReset}
              setIsPronunciationResultReset={setIsPronunciationResultReset}
            />
          </div>
        </div>
      )}
    </>
  );
};
