import { CSSProperties, forwardRef } from 'react';
import './rangeSlider.styl';

interface IRangeSlider extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    min?: number;
    max?: number;
    step?: number;
    value: number;
}

export const RangeSlider = forwardRef<HTMLInputElement, IRangeSlider>(
    ({ min = 0, max = 100, step = 1, value, className = '', ...props }, ref) => {
        const percent = ((value - min) / (max - min)) * 100;
        const minValueToHide = 10;
        const maxValueToHide = 90;

        return (
            <div className={`range-slider-container ${className}`}>
                <div className="range-slider-wrapper">
                    <input
                        type="range"
                        ref={ref}
                        className="range-slider"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        style={{ '--progress': `${percent}%` } as CSSProperties}
                        {...props}
                    />
                    {(percent < maxValueToHide && percent > minValueToHide) && <div
                        className="range-slider-current-value"
                        style={{ left: `calc(${percent}% + (${8 - percent * 0.16}px))` }}
                    >
                        {value}
                    </div>}
                </div>
                <div className="range-slider-labels flex-between-center">
                    <span>{minValueToHide > percent ? value : min}</span>
                    <span>{maxValueToHide < percent ? value : max}</span>
                </div>
            </div>
        );
    }
);

RangeSlider.displayName = 'RangeSlider';
