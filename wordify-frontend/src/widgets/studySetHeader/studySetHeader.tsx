import "./studySetHeader.styl";
import { useState } from "react";
import { ProgressLine } from "shared/ui/progressLine";

import ArrowRight from "shared/assets/icons/arrowRight.svg?react";

const NextBtn = <T,> ({
  onClick,
  userAnswer,
}: {
  onClick: () => void;
  userAnswer: T | null;
}) => {
  const [isNextBtnHovered, setIsNextBtnHovered] = useState(false);

  return (
    <span
      onClick={onClick}
      className={`cursor-pointer flex-y-center study-page-variants-progress-next ${isNextBtnHovered && userAnswer !== null ? "study-page-variants-progress-next-hover" : ""}`}
      onMouseEnter={() => setIsNextBtnHovered(true)}
      onMouseLeave={() => setIsNextBtnHovered(false)}
    >
      Next <ArrowRight />
    </span>
  );
};

interface IStudySetHeader<T> {
  wordIndexNumber?: number | null;
  percentageProgress: number;
  questionsLength?: number;
  handleNextClick: () => void;
  userAnswer: T | null;
}

export const StudySetHeader = <T,> ({
  userAnswer,
  wordIndexNumber,
  percentageProgress,
  questionsLength,
  handleNextClick,
}: IStudySetHeader<T>) => {
  return (
    <header className="flex-between-center study-page-variants-progress study-set-page-header">
      <span className="study-page-variants-progress-question-num">
        Question {wordIndexNumber! + 1} of {questionsLength}
      </span>
      <ProgressLine percentage={percentageProgress} />
      <NextBtn onClick={handleNextClick} userAnswer={userAnswer} />
    </header>
  );
};
