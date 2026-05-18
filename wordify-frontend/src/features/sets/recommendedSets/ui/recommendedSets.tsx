import { useEffect, useState } from "react";
import { Slider } from "shared/ui/slider";
import { RecommendedSetCard } from "widgets/recommendedSetCard";
import { fetchRecommendedSets, IRecommendedSet } from "features/sets/api/setsApi";
import { Loader } from "shared/ui/loader";
import { useAtom } from "jotai";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import { recommendedSetsAtom } from "../model/atoms";

export const RecommendedSets = () => {
    const [sets, setSets] = useAtom<IRecommendedSet[]>(recommendedSetsAtom);
    const [isLoading, setIsLoading] = useState(false);
    const [session] = useAtom(sessionAtom);

    useEffect(() => {
        const loadSets = async () => {
            if (session === null) return;

            setIsLoading(true);
            const result = await fetchRecommendedSets({ loaderFinally: () => setIsLoading(false) });
            if (result.ok && result.data) {
                setSets(result.data);
            }
        };
        loadSets();
    }, []);

    return (
        <>
            {isLoading ? <Loader /> : (
                <Slider sliderClassName="home-recommended-slider">
                    {sets.map(set => (
                        <RecommendedSetCard key={set.id} set={set} />
                    ))}
                </Slider>)}
        </>
    );
};
