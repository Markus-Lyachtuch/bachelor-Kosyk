import "./studyWithAi.styl";
import { useAtom } from "jotai";
import { Fragment } from "react/jsx-runtime";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Input } from "shared/ui/input";
import { Title } from "shared/ui/title";
import { Loader } from "shared/ui/loader";
import { Button } from "shared/ui/button";

import X from "shared/assets/icons/x.svg?react";
import Check from "shared/assets/icons/check.svg?react";
import CheckCircle from "shared/assets/icons/checkCircle.svg?react";

import { StudyOption } from "features/sets/studyVariantsSet/model/atoms";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";
import { generateAiStory } from "features/sets/api/setsApi";
import { missedWordsAndTheirCountAtom, recommendationForStudiedSetAtom } from "features/sets/studySetResults/model/atoms";

export const StudyWithAi = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();

  const [fullSetInfo] = useAtom(fullInfoSetAtom);
  const [,setMissedWordsCount] = useAtom(missedWordsAndTheirCountAtom);
  const [,setRecommendedMessage] = useAtom(recommendationForStudiedSetAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortedWords, setSortedWords] = useState<string[]>([]);
  const [splittedSentences, setSplittedSentences] = useState<string[]>([]);
  const [usedWords, setUsedWords] = useState<Map<string, string>>(new Map());
  const [isCheckModeEnabled, setIsCheckModeEnabled] = useState<boolean>(false);

  const isStudyWithAi = StudyOption.LEARN_WITH_AI === params.get("mode");
  const correctWordKey = (partOfSentenceIndex: number) => [...usedWords.keys()][partOfSentenceIndex];

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.trim().toLowerCase();

    const updatedUsedWords = new Map(usedWords);
    updatedUsedWords.set(correctWordKey(index), value);
    setUsedWords(updatedUsedWords);

    const allWords = [...updatedUsedWords.keys()].slice().sort();
    const usedValues = new Set(
      [...updatedUsedWords.values()].filter(
        (val) => val !== "" && allWords.includes(val),
      ),
    );

    setSortedWords(
      allWords.filter((word) => !usedValues.has(word)),
    );
  };

  const getRandomWords = (words: string[]) => {
    const MIN_WORDS = 4;
    const MAX_WORDS = 7;

    if (words.length === 0) return [];

    const shuffled = [...words];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const count =
      shuffled.length <= MIN_WORDS
        ? shuffled.length
        : Math.min(MAX_WORDS, shuffled.length);

    return shuffled.slice(0, count);
  };

  useEffect(() => {
    const createAiStory = async () => {
      if (!fullSetInfo?.words) return;

      setIsLoading(true);
      const randomWords = getRandomWords(
        fullSetInfo?.words.map((word) => word.term),
      );
      
      const result = await generateAiStory({
        words: randomWords,
        loaderFinally: () => setIsLoading(false),
      });

      if (result.ok) {
        setUsedWords((prev) => {
          const copyPrev = structuredClone(prev);
          result.data.usedWords.forEach((word) => copyPrev.set(word, ""));
          return copyPrev;
        });
        setSortedWords(result.data.usedWords.slice().sort());
        setSplittedSentences(result.data.maskedStory.split("____"))
      } else if (result.error) {
        nav(`/home/folders/${fullSetInfo?.folderId}/sets/${fullSetInfo?.id}`);
      }
    };

    createAiStory();
  }, [fullSetInfo]);

  useEffect(() => {
    if (isCheckModeEnabled) {
      setRecommendedMessage(`Review this set after 30 minutes to reinforce your learning.`);
      setMissedWordsCount(prev => {
        const copyPrev = structuredClone(prev);

        for (const [correctWord, userValue] of usedWords.entries()) {
          if (correctWord !== userValue) {
            copyPrev.set(correctWord, 1);
          }
        }

        return copyPrev;
      })
    }
  }, [isCheckModeEnabled])

  return (
    <>
      {isStudyWithAi && (
        <div className="flex-col study-set-page-study-with-ai">
          <div className="flex-col study-set-page-study-with-ai-title-block">
            <Title
              className="text-center"
              fontWeight="semibold"
              variant="primary"
            >
              Fill in the Blanks
            </Title>
            <p className="text-center">
              Choose a word from the word bank to complete the story below.
            </p>
          </div>

          {isLoading ? (
            <Loader />
          ) : (
            <>
              <div className="flex-x-center relative study-set-page-study-with-ai-box-words">
                {sortedWords.map((usedWord) => (
                  <Button key={usedWord} variant="primary">
                    {usedWord}
                  </Button>
                ))}
                <span className="study-set-page-study-with-ai-box-words-title absolute absolute-x-center">
                  WORD BANK
                </span>
              </div>

              <div className="study-set-page-study-with-ai-box-sentences">
                {splittedSentences.map(
                  (partOfSentence, partOfSentenceIndex) => (
                    <Fragment key={partOfSentence}>
                      <span>{partOfSentence}</span>
                      {partOfSentenceIndex !== splittedSentences.length - 1 && (
                        <div className="relative study-set-page-study-with-ai-box-sentences-input-wrapper">
                          <Input
                            readOnly={isCheckModeEnabled}
                            onChange={(e) =>
                              onChangeInput(e, partOfSentenceIndex)
                            }
                            variant="study"
                            placeholder="type..."
                          />
                          {correctWordKey(partOfSentenceIndex) ===
                            usedWords.get(
                              correctWordKey(partOfSentenceIndex),
                            ) &&
                            isCheckModeEnabled && (
                              <Check width={20} height={20} />
                            )}
                          {correctWordKey(partOfSentenceIndex) !==
                            usedWords.get(
                              correctWordKey(partOfSentenceIndex),
                            ) &&
                            isCheckModeEnabled && <X width={20} height={20} />}
                        </div>
                      )}
                    </Fragment>
                  ),
                )}
              </div>

              <Button
                disabled={[...usedWords.values()].some((value) => value === "")}
                onClick={() =>
                  isCheckModeEnabled
                    ? nav(
                        `/home/folders/${fullSetInfo?.folderId}/sets/${fullSetInfo?.id}/study/results`,
                      )
                    : setIsCheckModeEnabled(true)
                }
                className="study-set-page-study-with-ai-check-btn flex-y-center"
                variant="primary"
              >
                {isCheckModeEnabled ? (
                  "Show results"
                ) : (
                  <>
                    Check Answers <CheckCircle width={20} height={20} />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
};
