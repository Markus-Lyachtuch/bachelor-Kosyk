import './savedSets.styl';

import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { fetchSavedSets } from 'features/sets/api/setsApi';
import { savedSetsAtom } from 'features/sets/savedSets/model/atoms';

import { WordSetCard } from 'widgets/wordSetCard';

import { Loader } from 'shared/ui/loader';
import Bookmark from "shared/assets/icons/bookmark.svg?react";

export const SavedSets = () => {
    const [savedSets, setSavedSets] = useAtom(savedSetsAtom);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSavedSetsCallback = async () => {
            setIsLoading(true);
            const result = await fetchSavedSets({ loaderFinally: () => setIsLoading(false) });
            if (result.ok && result.data) {
                setSavedSets(result.data);
            }
        };

        fetchSavedSetsCallback();
    }, []);

    return (
        <div className='saved-sets-container flex-col'>
            {isLoading ? <Loader /> : (
                savedSets.length > 0 ? (
                    savedSets.map(set => (
                        <WordSetCard key={set.id} index={set.id} setInfo={set} />
                    ))
                ) : (
                    <div className="saved-sets-empty flex-center">
                        <Bookmark width={48} height={48} fill="var(--grey)" />
                        <p>You do not have saved sets yet</p>
                    </div>
                )
            )}
        </div>
    );
};
