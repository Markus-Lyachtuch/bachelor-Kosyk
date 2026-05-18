import "./segmentedControl.styl";

interface ISegmentedControl<T extends string> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: ISegmentedControl<T>) => {
  return (
    <div className="segmented-control flex-center">
      {options.map((option) => (
        <div
          key={option}
          className={`segmented-control-item flex-center cursor-pointer ${value === option ? "active" : ""
            }`}
          onClick={() => onChange(option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
};
