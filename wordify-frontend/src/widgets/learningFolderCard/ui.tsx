import "./learningFolderCard.styl";
import { ProgressLine } from "shared/ui/progressLine";
import { Title } from "shared/ui/title";
import { ISetFullInfo } from "features/sets/api/setsApi";
import { LearningStatus } from "features/sets/api/setsApi";
import { useNavigate } from "react-router-dom";

interface LearningFolderCardProps {
    set: ISetFullInfo;
}

export const LearningFolderCard = ({ set: { id, folderId, setImage, name, user: { name: userName }, words } }: LearningFolderCardProps) => {
    const nav = useNavigate();

    const handleClick = () => nav(`/home/folders/${folderId}/sets/${id}`);

    const keysForStatuses = Object.keys(LearningStatus);
    const valuesForEachState = Object.values(LearningStatus).map((_, index) => index);
    const countStages = keysForStatuses.length;

    const getValueByStatus = (status: LearningStatus) => {
        return keysForStatuses.findIndex((key) => key === status);
    }

    const calcPercentage = () => {
        const maxPercentage = (countStages - 1) * words.length;
        const currentPercentage = words.reduce((acc, word) => acc + valuesForEachState[getValueByStatus(word.status)], 0);
        return Math.round((currentPercentage / maxPercentage) * 100);
    }

    const percent = calcPercentage();


    return (
        <div onClick={handleClick} className="lcard-container">
            <div className="lcard-image-box">
                <img
                    src={setImage || "https://picsum.photos/240/200"}
                    alt={name}
                />
            </div>

            <div className="flex-col lcard-info">
                <div className="flex-col lcard-title-wrapper">
                    <Title variant="small-2">{name}</Title>
                    <p className="lcard-author">{userName || "Unknown Author"}</p>
                </div>

                <div className="flex-col lcard-progress-wrapper">
                    <ProgressLine percentage={percent} />
                    <span className="lcard-status-text">
                        {percent}% complete
                    </span>
                </div>
            </div>
        </div>
    );
};
