import { Button } from "@mui/material";
import { useState, useEffect } from "react";

const DescriptionWithReadMore: React.FC<{ description: string }> = ({ description }) => {
  const words = description ? description.split(/\s+/) : [];
  const [expanded, setExpanded] = useState(false);
  const wordCount = 20;
  // Reset expanded state if description changes
  useEffect(() => {
    setExpanded(false);
  }, [description]);

  if (!description) return null;

  if (words.length <= wordCount) {
    return <div>{description}</div>;
  }

  return (
    <div>
      {expanded
        ? description
        : words.slice(0, wordCount).join(" ") + "..."}
      <Button
        size="small"
        sx={{ ml: 1, textTransform: "none", fontSize: "0.9em" }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? "Read less" : "Read more"}
      </Button>
    </div>
  );
};

export default DescriptionWithReadMore;
