import { useState } from 'react';
import './searchPage.styl';
import { SearchSets } from 'features/sets/searchSets/ui';
import { SearchFilter } from "shared/ui/searchFilter";
import { ModalSearchFilter } from 'widgets/modalSearchFilter';
import { IRecommendedSet, fetchSearchSets } from 'features/sets/api/setsApi';

export const SearchPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchSets, setSearchSets] = useState<IRecommendedSet[]>([]);
    const [isFilterModalShowed, setIsFilterModalShowed] = useState(false);

    const onCLickSearchFilter = () => {
        setIsFilterModalShowed(true);
    }

    const handleApplyFilters = async (filters: { search: string; quantity: number; level: string | null }) => {
        setIsLoading(true);
        console.log('filters', filters);

        const result = await fetchSearchSets({
            search: filters.search,
            quantity: filters.quantity,
            level: filters.level,
            loaderFinally: () => setIsLoading(false),
        });

        if (result.ok && result.data) {
            setSearchSets(result.data);
        }
    }

    return (
        <div className='search-page flex-col'>
            <div className='flex-x-end'>
                <SearchFilter onClick={onCLickSearchFilter} />
            </div>
            <SearchSets searchSets={searchSets} setSearchSets={setSearchSets} isLoading={isLoading} setIsLoading={setIsLoading} />

            <ModalSearchFilter
                isModalShowed={isFilterModalShowed}
                onClose={() => setIsFilterModalShowed(false)}
                onApply={handleApplyFilters}
            />
        </div>
    )
}
