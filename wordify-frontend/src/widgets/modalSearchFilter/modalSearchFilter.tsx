import './modalSearchFilter.styl';
import { useState } from 'react';
import { Modal } from 'shared/ui/modal';
import { Title } from 'shared/ui/title';
import { Input } from 'shared/ui/input';
import { SegmentedControl } from 'shared/ui/segmentedControl';
import { Button } from 'shared/ui/button';
import { RangeSlider } from 'shared/ui/rangeSlider';

interface IModalSearchFilter {
    isModalShowed: boolean;
    onClose: () => void;
    onApply: (filters: { search: string; quantity: number; level: string | null }) => void;
}

const levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const ModalSearchFilter = ({ isModalShowed, onClose, onApply }: IModalSearchFilter) => {
    const [search, setSearch] = useState('');
    const [quantity, setQuantity] = useState(4);
    const [level, setLevel] = useState<string | null>(null);

    const handleApply = () => {
        onApply({
            search,
            quantity,
            level
        });
        onClose();
    };

    return (
        <Modal isModalShowed={isModalShowed} onClose={onClose} className="modal-search-container">
            <div className="modal-search flex-col">
                <Title variant="small">Find new sets</Title>

                <div className="modal-search-content flex-col">
                    <div className="modal-search-field flex-col">
                        <Input
                            placeholder="Enter set name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="modal-search-field flex-col">
                        <Title variant="small-2">By Quantity of words</Title>
                        <RangeSlider
                            min={4}
                            max={100}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                    </div>

                    <div className="modal-search-field flex-col">
                        <Title variant="small-2">By Level</Title>
                        <SegmentedControl
                            options={levelOptions}
                            value={level}
                            onChange={(val) => setLevel(val)}
                        />
                    </div>
                </div>

                <footer className="flex-x-end">
                    <div className="modal-search-btns flex-y-center">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={handleApply}>Search</Button>
                    </div>
                </footer>
            </div>
        </Modal>
    );
};
