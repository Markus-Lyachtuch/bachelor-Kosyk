import "./wordDefinitionCard.styl";

interface IWordDefinitionCard {
  term: string;
  definition: string | null;
  image: string | null;
}

export const WordDefinitionCard = ({
  term,
  definition,
  image,
}: IWordDefinitionCard) => {
  return (
    <div className="word-definition-card">
      <div className="word-definition-card-term">
        <span>{term}</span>
      </div>

      <div className="word-definition-card-definition">
        <p>{definition}</p>
      </div>

      {image && <div className="word-definition-card-image-container">
        <img
          src={image}
          alt={term}
          className="word-definition-card-image"
        />
      </div>}
    </div>
  );
};
