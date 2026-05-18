import './savedPage.styl';
import { SavedSets } from 'features/sets/savedSets/ui';

export const SavedPage = () => {
    return (
        <div className='saved-page flex-col'>
            <h1 className='saved-page-title'>Saved Sets</h1>
            <SavedSets />
        </div>
    );
};
