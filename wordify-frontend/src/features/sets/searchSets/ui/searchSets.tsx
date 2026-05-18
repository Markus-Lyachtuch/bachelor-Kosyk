import { Dispatch, SetStateAction, useEffect } from 'react';
import './searchSets.styl';
import { useAtom } from 'jotai';
import { recommendedSetsAtom } from 'features/sets/recommendedSets/model/atoms';
import { fetchRecommendedSets, IRecommendedSet } from 'features/sets/api/setsApi';
import { Loader } from 'shared/ui/loader';
import { WordSetCard } from 'widgets/wordSetCard';

import Search from "shared/assets/icons/search.svg?react";

interface ISearchSets {
    setSearchSets: Dispatch<SetStateAction<IRecommendedSet[]>>;
    searchSets: IRecommendedSet[];
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    isLoading: boolean;
}

export const SearchSets = ({ setSearchSets, searchSets, setIsLoading, isLoading }: ISearchSets) => {
    const [recommendedSets, setRecommendedSets] = useAtom(recommendedSetsAtom);

    useEffect(() => {
        if (!recommendedSets || recommendedSets.length === 0) {
            const fetchRecommendedSetsCallBack = async () => {
                setIsLoading(true);
                const result = await fetchRecommendedSets({ loaderFinally: () => setIsLoading(false) });
                if (result.ok && result.data) {
                    setRecommendedSets(result.data);
                }
            }

            fetchRecommendedSetsCallBack();
        } else {
            setSearchSets(recommendedSets);
        }
    }, [recommendedSets]);

    return (
        <div className='search-sets-container flex-col'>
            {isLoading ? <Loader /> : (
                searchSets.map(set => (
                    <WordSetCard key={set.id} index={set.id} setInfo={set} />
                ))
            )}
            {searchSets.length === 0 && !isLoading && <div className="flex-center search-sets-empty">
                <Search width={48} height={48} fill="var(--grey)" />
                <p>No results found :(</p>
            </div>}
        </div>
    )
}
