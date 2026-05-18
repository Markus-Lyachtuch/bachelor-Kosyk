import { useEffect, useRef, useState } from "react";

export const useDropdown = () => {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    if (isDropdownVisible && popoverRef.current && containerRef.current) {
      popoverRef.current.style.height = `${popoverRef.current.scrollHeight}px`;
    } else if (popoverRef.current && containerRef.current) {
      popoverRef.current.style.height = `0px`;
    }
  }, [isDropdownVisible]);

  return { popoverRef, containerRef, isDropdownVisible, setIsDropdownVisible };
};
