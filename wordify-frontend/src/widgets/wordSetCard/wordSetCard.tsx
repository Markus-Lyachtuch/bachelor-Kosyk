import "./wordSetCard.styl";
import { useNavigate, useParams } from "react-router-dom";
import { IRecommendedSet } from "features/sets/api/setsApi";
import { convertMinsToHoursAndMins } from "shared/lib/helpers";

import StarFill from "shared/assets/icons/starFill.svg?react";
import ClockFill from "shared/assets/icons/clockFill.svg?react";

interface IWordSetCard {
  index: number;
  setInfo: IRecommendedSet;
}

export const WordSetCard = ({ index, setInfo }: IWordSetCard) => {
  const nav = useNavigate();
  const { id } = useParams();
  const { name, setImage, user, level, timeToStudy, rating, wordsCount, folder: { id: folderId } } =
    setInfo;

  const { countHours, countMinutes } = timeToStudy
    ? convertMinsToHoursAndMins(timeToStudy)
    : { countHours: 0, countMinutes: 0 };

  const handleViewSet = () => {
    nav(`/home/folders/${id ? id : folderId}/sets/${index}`);
  };

  return (
    <div className="word-card">
      <img
        src={
          setImage ||
          "https://wordify-data-bucket.s3.eu-north-1.amazonaws.com/sets/default-set-img.webp"
        }
        alt="Food"
        className="word-card-img"
      />

      <div className="word-card-content">
        <div className="content-top">
          <div className="info-main">
            <div className="title-group">
              <h3 className="card-title">{name}</h3>
              <span className="card-level">{level?.level ?? "N/A"}</span>
            </div>
            <p className="card-count">{wordsCount ?? 0} words</p>
          </div>

          <div className="info-stats">
            <span className="stat-item">
              <StarFill /> <p>{rating ? `${rating}/5` : "N/A"}</p>
            </span>
            <span className="stat-item">
              <ClockFill />
              <p>
                {countHours > 0 ? `${countHours}h ` : ""}
                {countMinutes}m
              </p>
            </span>
          </div>
        </div>

        <div className="content-bottom">
          <span className="card-author">Author: {user.name ?? "N/A"}</span>
          <button onClick={handleViewSet} className="view-btn">
            View set
          </button>
        </div>
      </div>
    </div>
  );
};
