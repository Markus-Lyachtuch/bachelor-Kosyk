import "./dropdown.styl";
import { Popover } from "../popover";
import { ActionItem } from "../actionItem";
import { useDropdown } from "shared/hooks/useDropdown";
import Chevron from "shared/assets/icons/chevron.svg?react";
import { useEffect, useState } from "react";
import { useClickOutside } from "shared/hooks/useClickOutside";
import { Loader } from "../loader";

interface IDropdown<T> {
  keyForName: keyof T;
  placeholder?: string;
  keyForValue: keyof T;
  options: T[] | null;
  selectedOption?: T | null;
  isLoading?: boolean;
  onSelectOption?: (option: T) => void;
  error?: string;
}

export const Dropdown = <T,>({
  keyForName,
  placeholder,
  keyForValue,
  options,
  selectedOption: alreadySelectedOption,
  isLoading,
  onSelectOption,
  error,
}: IDropdown<T>) => {
  const { popoverRef, isDropdownVisible, containerRef, setIsDropdownVisible } =
    useDropdown();
  const [selectedOption, setSelectedOption] = useState<T | null>(null);

  const handleOptionClick = (option: T) => {
    setIsDropdownVisible(false);
    setSelectedOption(option);
    onSelectOption?.(option);
  };

  useEffect(() => {
    if (alreadySelectedOption) {      
      handleOptionClick(alreadySelectedOption);
    }
  }, [alreadySelectedOption]);

  useClickOutside(containerRef, () => setIsDropdownVisible(false));

  return (
    <div className="dropdown cursor-pointer" ref={containerRef}>
      <div className="flex-col dropdown-error-wrapper">
        <div
          role="select"
          className="dropdown-select flex-between-center"
          onClick={() => setIsDropdownVisible(!isDropdownVisible)}
        >
          <span className="dropdown-placeholder">
            {selectedOption
              ? (selectedOption[keyForName] as unknown as string)
              : placeholder}
          </span>
          <Chevron fill="var(--grey)" />
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
      </div>
      <Popover
        ref={popoverRef}
        className={`no-scrollbar ${isDropdownVisible ? "show" : "hide"}`}
      >
        {options &&
          options.length > 0 &&
          options.map((option) => (
            <ActionItem
              key={option[keyForValue] as unknown as string}
              title={option[keyForName] as unknown as string}
              onClick={() => handleOptionClick(option)}
              className={`cursor-pointer ${selectedOption && option[keyForValue] === selectedOption?.[keyForValue] && "actionitem-selected"}`}
            />
          ))}
        {!options || options.length === 0 ? (
          <p>No options available :(</p>
        ) : null}
        {isLoading && <Loader />}
      </Popover>
    </div>
  );
};
