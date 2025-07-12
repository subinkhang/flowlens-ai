import { TAG_SUGGESTIONS } from "./types";

export const Suggestions = ({
  onClickTag,
}: {
  onClickTag: (tag: string) => void;
}) => (
  <div className="suggestions-container">
    {TAG_SUGGESTIONS.map((tag) => (
      <div
        key={tag}
        className="suggestion-item"
        onClick={() => onClickTag(tag)}
      >
        {tag}
      </div>
    ))}
  </div>
);
