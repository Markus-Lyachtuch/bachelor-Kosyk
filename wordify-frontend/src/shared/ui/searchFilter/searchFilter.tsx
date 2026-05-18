import './searchFilter.styl';
import SlidersHorizontal from 'shared/assets/icons/slidersHorizontal.svg?react';

interface ISearchFilter {
    onClick: () => void;
}

export const SearchFilter = ({ onClick }: ISearchFilter) => {
    return (
        <div onClick={onClick} className='flex-center search-filter'>
            <span>Search by</span>
            <SlidersHorizontal width={16} height={16} />
        </div>
    )
}
