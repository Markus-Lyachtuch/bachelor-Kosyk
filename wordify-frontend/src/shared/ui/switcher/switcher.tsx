import "./switcher.styl";

interface ISwitcher {
  isActive: boolean;
  onClick: () => void;
}

export const Switcher = ({ isActive, onClick }: ISwitcher) => {
  return (
    <div onClick={onClick} className={`cursor-pointer switcher ${isActive && "switcher-active"}`}>
      <div className="switcher-ball"></div>
    </div>
  );
};
