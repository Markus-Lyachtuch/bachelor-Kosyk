import "./emptyState.styl";

interface IEmptyState {
  btnText: string;
  description: string;
  onClick?: () => void;
}

export const EmptyState = ({ description, btnText, onClick }: IEmptyState) => {
  return (
    <div className="empty-state flex-center">
      <div className="flex-col flex-y-center">
        <p className="empty-state-description">{description}</p>
        <button className="empty-state-btn" onClick={onClick}>
          {btnText}
        </button>
      </div>
    </div>
  );
};
