import "./modalSetRating.styl"
import { useEffect, useState } from "react";

import { Modal } from "shared/ui/modal"
import { Title } from "shared/ui/title";
import { Loader } from "shared/ui/loader";
import { Button } from "shared/ui/button";

import Star from "shared/assets/icons/starFill.svg?react"
import { XIconBtn } from "shared/ui/xIconBtn";


interface IModalSetRating {
    onClose: () => void;
    isModalShowed: boolean;
    isLoading: boolean;
    onSetRating: (rating: number) => void;
    selectedRating?: number;
}

export const ModalSetRating = ({ onClose, isModalShowed, isLoading, onSetRating, selectedRating }: IModalSetRating) => {
    const [rating, setRating] = useState<number>(0);

    const handleStarClick = (starIndex: number) => {
        setRating(starIndex + 1);
    };

    useEffect(() => {
        if (selectedRating) handleStarClick(selectedRating - 1);
    }, [selectedRating]);

    return (
        <Modal
            className="modal-set-rating-container"
            onClose={onClose}
            isModalShowed={isModalShowed}
        >
            <div className="modal-set-rating flex-col flex-y-center">
                <header className="modal-set-rating-title-and-subtitle flex-col">
                    <div className="modal-set-rating-close"><XIconBtn className="cursor-pointer" width={20} height={20} onClick={onClose} /></div>
                    <div className="flex-col flex-y-center">
                        <Title variant="small" fontWeight="semibold">Rate set</Title>
                        <p className="modal-set-rating-subtitle">Rate 1 to 5</p>
                    </div>
                </header>
                <div className="modal-set-rating-stars">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className={`cursor-pointer ${index < rating ? 'modal-set-rating-star-selected' : 'modal-set-rating-star'}`} onClick={() => handleStarClick(index)}>
                            <Star width={39} height={37} />
                        </div>
                    ))}
                </div>

                {isLoading ? <Loader /> : <Button className="modal-set-rating-submit-btn" variant="primary" onClick={() => rating > 0 && onSetRating(rating)}>Send</Button>}
            </div>
        </Modal>
    )
}
