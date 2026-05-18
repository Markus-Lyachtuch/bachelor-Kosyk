import { useEffect, useState } from "react";
import "./progressLine.styl";

interface IProgressLine {
  percentage: number;
}

export const ProgressLine = ({ percentage }: IProgressLine) => {
  const [styleWidth, setStyleWidth] = useState("0");  

  useEffect(() => {
    setStyleWidth(percentage + "%");
  }, [percentage]);
  
  return (
    <div className="line">
      <div
        className="line-current-progress"
        style={{ width: styleWidth }}
      ></div>
    </div>
  );
};
