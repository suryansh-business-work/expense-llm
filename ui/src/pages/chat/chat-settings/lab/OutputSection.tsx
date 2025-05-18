import { useState } from "react";
import { Typography, Box } from "@mui/material";
import Editor from "@monaco-editor/react";

const defaultJson = `{
  "functionName": "scrapeEmailsFromWebsite",
  "functionParams": {
    "url": "https://example.com"
  }
}`;

const OutputSection = () => {
  const [jsonValue, setJsonValue] = useState(defaultJson);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        AI Output (JSON)
      </Typography>
      <Editor
        height="300px"
        defaultLanguage="json"
        value={jsonValue}
        onChange={v => setJsonValue(v || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </Box>
  );
};

export default OutputSection;