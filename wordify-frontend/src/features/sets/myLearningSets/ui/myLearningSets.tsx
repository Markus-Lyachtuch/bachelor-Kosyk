import { useEffect, useState } from "react";
import { Slider } from "shared/ui/slider";
import { LearningFolderCard } from "widgets/learningFolderCard";
import { fetchMyLearningSets, IMyLearningSet, ISetFullInfo } from "features/sets/api/setsApi";
import { Loader } from "shared/ui/loader";
import { useAtom } from "jotai";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import { Title } from "shared/ui/title";

export const MyLearningSets = () => {
    const [sets, setSets] = useState<ISetFullInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [session] = useAtom(sessionAtom);

    useEffect(() => {
        const loadSets = async () => {
            if (session === null) return;

            setIsLoading(true);
            const result = await fetchMyLearningSets({ loaderFinally: () => setIsLoading(false) });
            if (result.ok && result.data) {
                setSets(result.data);
            }
        };
        loadSets();
    }, [session]);

    if (!isLoading && sets.length === 0) {
        return null;
    }

    return (
        <div className="flex-col home-section">
            <Title className="main-left-title" variant="primary">My learning</Title>
            {isLoading ? <Loader /> : (
                <Slider sliderClassName="home-my-learning-slider">
                    {sets.map(set => (
                        <LearningFolderCard key={set.id} set={set} />
                    ))}
                </Slider>
            )}
        </div>
    );
};
