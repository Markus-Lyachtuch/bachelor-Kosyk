import './threeDots.styl';

interface IThreeDots {
    onClick: () => void;
    className?: string;
    gapVariant?: 'small' | 'default';
}

export const ThreeDots = ({ onClick, gapVariant = 'default', className = '' }: IThreeDots) => {
  return (
    <div onClick={onClick} className={`three-dots-container three-dots-container-variant-${gapVariant} flex-center ${className}`}>
      <div className="dot-item"></div>
      <div className="dot-item"></div>
      <div className="dot-item"></div>
    </div>
  )
}
