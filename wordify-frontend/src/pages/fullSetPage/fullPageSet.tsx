import "./fullPageSet.styl";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Pen from "shared/assets/icons/pen.svg?react";
import Head from "shared/assets/icons/head.svg?react";
import Copy from "shared/assets/icons/copy.svg?react";
import Trash from "shared/assets/icons/trash.svg?react";
import Books from "shared/assets/icons/books.svg?react";
import Bookmark from "shared/assets/icons/bookmark.svg?react";
import Settings from "shared/assets/icons/settings.svg?react";
import StarFill from "shared/assets/icons/starFill.svg?react";
import ClockFill from "shared/assets/icons/clockFill.svg?react";
import StarNotFilled from "shared/assets/icons/starNotFilled.svg?react";
import BookMarkSimple from "shared/assets/icons/bookmarkSimple.svg?react";

import {
  convertMinsToHoursAndMins,
  formatCreatedAtEn,
} from "shared/lib/helpers";

import { LearningStatus, saveSet, unsaveSet, fetchSavedSets, rateSet } from "features/sets/api/setsApi";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";

import { WordDefinitionCard } from "widgets/wordDefinitionCard";
import { LevelBadge } from "shared/ui/levelBadge";
import { isDeleteModalSetShowedAtom } from "features/sets/deleteSet/model/atoms";
import { DeleteSet } from "features/sets/deleteSet/ui";
import { EditSet } from "features/sets/editSet/ui";
import { isEditSetModalOpenedAtom } from "features/sets/editSet/model/atoms";
import { CopySet } from "features/sets/copySet/ui";
import { isCopySetModalOpenedAtom } from "features/sets/copySet/model/atoms";
import { FetchSetById } from "features/sets/fetchSetById/ui";
import { StudyOption, usersChoiceStudyOptionAtom } from "features/sets/studyVariantsSet/model/atoms";
import { StudySetSettings } from "features/sets/studySetSettings/ui";
import { isModalStudySetSettingsAtom } from "features/sets/studySetSettings/model/atoms";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import { ModalSetRating } from "widgets/modalSetRating";

export const FullPageSet = () => {
  const nav = useNavigate();
  const [session] = useAtom(sessionAtom);
  const [fullSetInfo, setFullSetInfo] = useAtom(fullInfoSetAtom);
  const { countHours, countMinutes } = fullSetInfo?.timeToStudy
    ? convertMinsToHoursAndMins(fullSetInfo.timeToStudy)
    : { countHours: 0, countMinutes: 0 };

  const [, setIsEditSetModalShowed] = useAtom(isEditSetModalOpenedAtom);
  const [, setIsCopySetModalShowed] = useAtom(isCopySetModalOpenedAtom);
  const [, setIsModalDeleteSetShowed] = useAtom(isDeleteModalSetShowedAtom);
  const [, setUsersChoiceStudyOption] = useAtom(usersChoiceStudyOptionAtom);
  const [, setIsStudySetSettingsShowed] = useAtom(isModalStudySetSettingsAtom);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [savedSetId, setSavedSetId] = useState<number | null>(null);

  const [isModalSetRatingShowed, setIsModalSetRatingShowed] = useState(false);
  const [isModalSetRatingLoading, setIsModalSetRatingLoading] = useState(false);

  const writingModeBlockingWordIndex =
    fullSetInfo?.words.findIndex(
      (word) =>
        word.status !== LearningStatus.WRITE &&
        word.status !== LearningStatus.LEARNED,
    ) ?? -1;

  const isWritingModeUnAvailable = writingModeBlockingWordIndex !== -1;
  const isLearnWithAIModeUnAvailable = fullSetInfo?.words.some(
    (word) => word.status !== LearningStatus.LEARNED,
  );
  const isStudyingModeUnAvailable = !isWritingModeUnAvailable || !isLearnWithAIModeUnAvailable;

  useEffect(() => {
    if (!fullSetInfo || session?.user.id === fullSetInfo.userId) return;

    const checkIfSaved = async () => {
      const result = await fetchSavedSets();
      if (result.ok && result.data) {
        const found = result.data.some((s) => {
          if (s.id === fullSetInfo.id) {
            const savedSetIdFound = s.savedSet.find(savedSet => session?.user.id === savedSet.userId)?.id
            setSavedSetId(savedSetIdFound ? savedSetIdFound : null);
            return true;
          }
          return false;
        });
        setIsSaved(found);
      }
    };

    checkIfSaved();
  }, [fullSetInfo?.id]);

  const handleToggleSave = async () => {
    if (!fullSetInfo || isSaveLoading) return;
    setIsSaveLoading(true);

    if (isSaved && savedSetId) {
      const result = await unsaveSet({
        setId: savedSetId,
        loaderFinally: () => setIsSaveLoading(false),
      });
      if (result.ok) {
        setIsSaved(false);
      }
    } else {
      const result = await saveSet({
        setId: fullSetInfo.id,
        loaderFinally: () => setIsSaveLoading(false),
      });
      if (result.ok) {
        setSavedSetId(result.data.id)
        setIsSaved(true);
      }
    }
  };

  const handleStudyClick = () => {
    setUsersChoiceStudyOption(StudyOption.STUDY);
    nav(`study?wordIndex=0`);
  };

  const handleWriteClick = () => {
    setUsersChoiceStudyOption(StudyOption.WRITE);
    nav(`study?wordIndex=0`);
  };

  const handleLearnWithAIClick = () => {
    setUsersChoiceStudyOption(StudyOption.LEARN_WITH_AI);
    nav(`study?mode=LEARN_WITH_AI`);
  };

  const handleSetRating = async (rating: number) => {
    if (!fullSetInfo?.id) return

    setIsModalSetRatingLoading(true);

    const result = await rateSet({
      setId: fullSetInfo?.id,
      rating,
      loaderFNNegative: () => setIsModalSetRatingLoading(false),
      loaderFNPositive: () => setIsModalSetRatingLoading(false),
      loaderFinally: () => setIsModalSetRatingLoading(false),
    });
    if (result.ok) {
      setIsModalSetRatingShowed(false);
      setFullSetInfo({
        ...fullSetInfo,
        marks: fullSetInfo?.marks.map(mark => mark.userId === session?.user.id ? result.data : mark)
      });
    }
  };

  useEffect(() => {
    if (!fullSetInfo) return;
    setFullSetInfo({
      ...fullSetInfo,
      rating: fullSetInfo.marks.reduce((acc, mark) => acc + mark.rating, 0) / fullSetInfo.marks.length,
    });
  }, [fullSetInfo?.marks])

  return (
    <div className="full-set-page-container">
      <FetchSetById>
        <div className="main-content">
          <header className="header">
            <h1>{fullSetInfo?.name}</h1>
            {session?.user.id === fullSetInfo?.userId && <div className="button-group">
              <button
                disabled={isLearnWithAIModeUnAvailable}
                onClick={handleLearnWithAIClick}
                className="full-set-page-btn"
              >
                Learn with AI <Head />
              </button>
              <button
                onClick={handleStudyClick}
                disabled={isStudyingModeUnAvailable}
                className="full-set-page-btn full-set-page-btn-white"
              >
                Study <Books width={19} height={19} fill="var(--black)" />
              </button>
              <button
                disabled={isWritingModeUnAvailable}
                onClick={handleWriteClick}
                className="full-set-page-btn full-set-page-btn-white"
              >
                Write <Pen />
              </button>
            </div>}
          </header>

          <section className="stats-bar">
            <div className="info">
              <span className="word-count">
                {fullSetInfo?.words.length} words
              </span>
              <LevelBadge>{fullSetInfo?.level?.level || "N/A"}</LevelBadge>
            </div>
            <div className="meta">
              <span>
                <StarFill />
                {fullSetInfo?.rating ? `${fullSetInfo.rating}/5` : "N/A"}
              </span>
              <span>
                <ClockFill />
                {countHours > 0 ? `${countHours}h ` : ""}
                {countMinutes}m
              </span>
            </div>
          </section>

          <section className="author-row">
            <div className="author-info">
              {fullSetInfo?.user?.avatarUrl && <img className="avatar" src={fullSetInfo?.user?.avatarUrl} />}
              {!(fullSetInfo?.user.avatarUrl) && <div className="avatar">
                {fullSetInfo?.user.name ? fullSetInfo.user.name.charAt(0) : "N"}
              </div>}
              <div className="text">
                <p className="name">
                  Author <strong>{fullSetInfo?.user.name ?? "N/A"}</strong>
                </p>
                <p className="date">
                  Created {formatCreatedAtEn(fullSetInfo?.createdAt || "")}
                </p>
              </div>
            </div>
            <div className="action-buttons">
              {session?.user.id === fullSetInfo?.userId ? <>
                <button
                  onClick={() => setIsModalDeleteSetShowed(true)}
                  type="button"
                  className="btn-icon"
                >
                  Delete
                  <Trash />
                </button>
                <button
                  onClick={() => setIsEditSetModalShowed(true)}
                  className="btn-icon btn-edit"
                >
                  Edit
                  <Pen />
                </button>
                <button onClick={() => setIsStudySetSettingsShowed(true)} className="btn-more"><Settings /></button>
              </> : <>
                <button onClick={() => setIsModalSetRatingShowed(true)} className="btn-icon">
                  Rate
                  <StarNotFilled width={17} height={17} />
                </button>
                <button onClick={() => setIsCopySetModalShowed(true)} className="btn-icon">
                  Copy
                  <Copy width={17} height={17} />
                </button>
                <button
                  className={`btn-icon ${isSaved ? 'btn-icon-saved' : ''}`}
                  onClick={handleToggleSave}
                  disabled={isSaveLoading}
                >
                  {isSaved ? 'Saved' : 'Save'}
                  {isSaved
                    ? <Bookmark width={17} height={17} fill="var(--primary)" />
                    : <BookMarkSimple width={17} height={17} />
                  }
                </button>
              </>}
            </div>
          </section>

          <div className="word-list">
            {fullSetInfo?.words && fullSetInfo.words.length > 0 ? (
              fullSetInfo.words.map((wordItem) => (
                <WordDefinitionCard {...wordItem} key={wordItem.id} />
              ))
            ) : (
              <p>The set is empty now :(</p>
            )}
          </div>
        </div>
      </FetchSetById>

      <DeleteSet />
      <EditSet />
      <CopySet />
      {fullSetInfo?.marks && <ModalSetRating
        selectedRating={fullSetInfo?.marks.find(mark => mark.userId === session?.user.id)?.rating}
        onClose={() => setIsModalSetRatingShowed(false)}
        isModalShowed={isModalSetRatingShowed}
        isLoading={isModalSetRatingLoading}
        onSetRating={handleSetRating}
      />}
      {fullSetInfo?.settings && <StudySetSettings />}
    </div>
  );
};
