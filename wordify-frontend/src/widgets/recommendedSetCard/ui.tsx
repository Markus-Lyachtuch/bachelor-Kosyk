import "./recommendedSetCard.styl";
import Clock from "shared/assets/icons/clockFill.svg?react";
import Star from "shared/assets/icons/starFill.svg?react";
import { Button } from "shared/ui/button";
import { Title } from "shared/ui/title";
import { IRecommendedSet } from "features/sets/api/setsApi";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

export const RecommendedSetCard: FC<{ set: IRecommendedSet }> = ({ set }) => {
    const nav = useNavigate();
    const { id, folder: { id: folderId } } = set;

    return (
        <div className="rec-set-card">
            <div className="rec-card-image-wrapper">
                {set?.setImage && <img src={set?.setImage as string} alt={set?.name} />}
            </div>
            <div className="rec-card-content flex-col">
                <Title variant="small-2">{set?.name}</Title>
                <div className="rec-card-footer">
                    <div className="rec-stats">
                        <span className="flex-y-center"> <Star width={18} /> {set?.rating ? `${set?.rating}` : "N/A"}</span>
                        <span className="flex-y-center"> <Clock width={18} /> {set?.timeToStudy ? `${set?.timeToStudy}m` : "N/A"}</span>
                    </div>
                    <Button onClick={() => nav(`/home/folders/${folderId}/sets/${id}`)} variant="primary" className="rec-btn-start">View</Button>
                </div>
            </div>
        </div>
    );
};
