import "./slider.styl";
import useEmblaCarousel from "embla-carousel-react";
import { PropsWithChildren, ReactNode, useEffect } from "react";
import { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";

interface ISlider extends PropsWithChildren, EmblaOptionsType {
  sliderOuterChildren?: ReactNode;
  setApi?: (api: EmblaCarouselType) => void;
  sliderClassName?: string;
}

export const Slider = ({
  children,
  sliderOuterChildren,
  setApi,
  sliderClassName,
  ...props
}: ISlider) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ ...props });

  useEffect(() => {
    if (emblaApi && setApi) {
      setApi(emblaApi);
    }
  }, [emblaApi, setApi]);

  return (
    <div className={`slider ${sliderClassName ? sliderClassName : ''}`}>
      <div className="slider-viewport" ref={emblaRef}>
        <div className="slider-container">
          {children}
        </div>
      </div>

      {sliderOuterChildren}
    </div>
  );
};
