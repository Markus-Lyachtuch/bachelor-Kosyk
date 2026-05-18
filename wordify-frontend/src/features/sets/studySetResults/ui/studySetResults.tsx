import "./studySetResults.styl";
import { Title } from "shared/ui/title";

import { useAtom } from "jotai";
import {
  missedWordsAndTheirCountAtom,
} from "../model/atoms";

import { Button } from "shared/ui/button";
import { useNavigate } from "react-router-dom";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";
import { LearningStatus, sendScheduledEmail } from "features/sets/api/setsApi";
import {
  StudyOption,
  usersChoiceStudyOptionAtom,
} from "features/sets/studyVariantsSet/model/atoms";

import { SET_STUDY_SCORE } from "shared/const/score";

import Smile from "shared/assets/icons/smile.svg?react";
import SmileMeh from "shared/assets/icons/smileyMeh.svg?react";
import SmileSad from "shared/assets/icons/smileySad.svg?react";
import { useEffect, useState } from "react";

export const StudySetResults = () => {
  const nav = useNavigate();
  const [fullSetInfo] = useAtom(fullInfoSetAtom);
  const [missedWordsCount, setMissedWordsCount] = useAtom(
    missedWordsAndTheirCountAtom,
  );
  const [usersChoiceStudyOption] = useAtom(usersChoiceStudyOptionAtom);

  const [recommendedMessage, setRecommendedMessage] = useState<string>("");

  const handleReturnToSet = () => {
    nav(`/home/folders/${fullSetInfo?.folderId}/sets/${fullSetInfo?.id}`);
    setMissedWordsCount(new Map());
  };

  const additionalCheckIfStudied = (status: LearningStatus) =>
    usersChoiceStudyOption === StudyOption.STUDY &&
    status !== LearningStatus.WRITE;

  const withoutStudiedWords =
    usersChoiceStudyOption === StudyOption.WRITE ||
    usersChoiceStudyOption === StudyOption.LEARN_WITH_AI
      ? fullSetInfo?.words
      : fullSetInfo?.words.filter(
          (word) =>
            word.status !== LearningStatus.LEARNED ||
            additionalCheckIfStudied(word.status),
        );

  const countPercentageOfSuccessFullWords =
    Array.isArray(withoutStudiedWords) &&
    ((withoutStudiedWords.length - missedWordsCount.size) /
      withoutStudiedWords.length) *
      100;

  useEffect(() => {
    const sendScheduledEmailNotification = async () => {
      if (!fullSetInfo?.id || (fullSetInfo.words.some(word => word.status !== LearningStatus.LEARNED) && fullSetInfo.userSetProgress.currentStage <= 1) || usersChoiceStudyOption !== StudyOption.WRITE) return
      const result = await sendScheduledEmail({ setId: fullSetInfo?.id, scorePercentage: countPercentageOfSuccessFullWords as number });

      if (result.ok) {
        setRecommendedMessage(result.data.message);
      }
    }

    sendScheduledEmailNotification();
  }, [fullSetInfo]);

  return (
    <div className="study-set-page-results">
      <header className="flex-center">
        {(+countPercentageOfSuccessFullWords > SET_STUDY_SCORE.POSITIVE && (
          <Smile />
        )) ||
          (+countPercentageOfSuccessFullWords > SET_STUDY_SCORE.NORMAL && (
            <SmileMeh />
          )) ||
          (+countPercentageOfSuccessFullWords <= SET_STUDY_SCORE.NORMAL && (
            <SmileSad />
          ))}

        <Title variant="primary">
          {(+countPercentageOfSuccessFullWords).toFixed(0) + "%"}
        </Title>
      </header>

      <div className="study-set-page-results-words-container">
        <Title
          className="study-set-page-results-difficult-words-title"
          variant="small-2"
        >
          Difficult words
        </Title>

        <div className="study-set-page-results-difficult-words-container">
          <header className="flex-between-center">
            <Title variant="small-3" fontWeight="semibold">
              Word
            </Title>
            <Title variant="small-3" fontWeight="semibold">
              Missed count
            </Title>
          </header>

          <div className="flex-col no-scrollbar study-set-page-results-difficult-words-container-items">
            {Array.from(missedWordsCount.entries()).map(([word, count]) => (
              <div
                key={word}
                className="flex-between-center study-set-page-results-difficult-words-container-item"
              >
                <span>{word}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {recommendedMessage && (
          <div className="study-set-page-results-recommendation">
            <p>
              <b>Recommendation:</b> {recommendedMessage}
            </p>
          </div>
        )}

        <Button
          onClick={handleReturnToSet}
          className="study-set-page-results-btn"
          variant="primary"
        >
          Return to set
        </Button>
      </div>
    </div>
  );
};
