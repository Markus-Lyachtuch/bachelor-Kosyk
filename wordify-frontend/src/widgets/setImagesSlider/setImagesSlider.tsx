import { useEffect, useState } from "react";
import { EmblaCarouselType } from "embla-carousel";
import "./setImagesSlider.styl";

import ChevronLeft from "shared/assets/icons/chevronLeft.svg?react";
import ChevronRight from "shared/assets/icons/chevronRight.svg?react";
import { Loader } from "shared/ui/loader";
import { Slider } from "shared/ui/slider";

interface ISliderBtn {
    onClick: () => void;
}

const SliderNextBtn = ({ onClick }: ISliderBtn) => {
    return (
        <button
            type="button"
            className="cursor-pointer flex-center slider-btn slider-next"
            onClick={onClick}
        >
            <ChevronRight />
        </button>
    );
};

const SliderPrevBtn = ({ onClick }: ISliderBtn) => {
    return (
        <button
            type="button"
            className="cursor-pointer flex-center slider-btn slider-prev"
            onClick={onClick}
        >
            <ChevronLeft />
        </button>
    );
};

interface ISlider<T> {
    slides?: T[];
    isLoading?: boolean;
    keyForAlt?: keyof T;
    keyForImage?: keyof T;
    keyForId?: keyof T;
    onSelectSlide?: (index: number) => void;
    selectedSlideIndex?: number | null;
}

export const SetImagesSlider = <T,>({
    slides,
    keyForImage,
    onSelectSlide,
    isLoading,
    keyForAlt,
    selectedSlideIndex,
}: ISlider<T>) => {
    const [sliderApi, setSliderApi] = useState<EmblaCarouselType>();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const goToPrev = () => sliderApi?.scrollPrev();
    const goToNext = () => sliderApi?.scrollNext();

    const selectImage = (index: number) => {
        setSelectedIndex(index);
        sliderApi?.scrollTo(index);
        onSelectSlide && onSelectSlide(index);
    };

    useEffect(() => {
        if (selectedSlideIndex !== null && selectedSlideIndex !== undefined && slides?.[selectedSlideIndex]) {
            selectImage(selectedSlideIndex);
        }
    }, [slides, selectedSlideIndex])

    return (
        <Slider setApi={setSliderApi} sliderOuterChildren={<><SliderPrevBtn onClick={goToPrev} /> <SliderNextBtn onClick={goToNext} /></>}>
            {slides &&
                keyForImage &&
                !isLoading &&
                slides.map((slide, index) => (
                    <img
                        key={index}
                        alt={keyForAlt ? String(slide[keyForAlt]) : `proposed-img-for-term-${index}`}
                        src={String(slide[keyForImage])}
                        className={`cursor-pointer slider-slide ${selectedIndex === index && "slider-slide-selected"}`}
                        onClick={() => selectImage(index)}
                    />
                ))}
            {isLoading && <Loader />}
            {slides?.length === 0 && !isLoading && <div className="slider-no-images-message flex-center">No images :(</div>}
        </Slider>
    );
};
