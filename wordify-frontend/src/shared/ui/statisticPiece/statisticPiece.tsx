import "./statisticPiece.styl";

interface IStatisticPiece {
  subTitle: string;
  statisticTitle: number;
}

export const StatisticPiece = ({
  statisticTitle,
  subTitle,
}: IStatisticPiece) => {
  return (
    <div>
      <h3 className="statistic-title">{statisticTitle}</h3>
      <h4 className="statistic-subtitle">{subTitle}</h4>
    </div>
  );
};
