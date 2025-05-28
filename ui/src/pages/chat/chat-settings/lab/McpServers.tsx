import { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Button,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";

// Example MCP server directories and servers
const MCP_SERVER_DIRECTORIES = [
  { label: "mcpservers.wiki", value: "mcpservers.wiki" }
];

const MCP_SERVERS = [
  { label: "Expense MCP Server", value: "expense" },
  { label: "Income MCP Server", value: "income" },
  { label: "Web Scrapper Server", value: "webscrapper" }
];

const schema = Joi.object({
  directory: Joi.string().required().label("MCP Server Directory"),
  servers: Joi.array().items(Joi.string().required()).min(1).label("MCP Servers"),
});

type FormValues = {
  directory: string;
  servers: string[];
};

const McpServers = () => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: joiResolver(schema),
    defaultValues: {
      directory: MCP_SERVER_DIRECTORIES[0].value,
      servers: [],
    },
  });

  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const onSubmit = (data: FormValues) => {
    setSubmitted(data);
  };

  return (
    <>
      <Typography variant="h5" className="mb-3">
        MCP Server Selection
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>MCP Server Directory</InputLabel>
          <Controller
            name="directory"
            control={control}
            render={({ field }) => (
              <Select {...field} label="MCP Server Directory">
                {MCP_SERVER_DIRECTORIES.map((dir) => (
                  <MenuItem value={dir.value} key={dir.value}>
                    {dir.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.directory && (
            <Typography color="error" variant="caption">
              {errors.directory.message as string}
            </Typography>
          )}
        </FormControl>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>MCP Servers</InputLabel>
          <Controller
            name="servers"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                multiple
                input={<OutlinedInput label="MCP Servers" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => {
                      const label = MCP_SERVERS.find((srv) => srv.value === value)?.label || value;
                      return <Chip key={value} label={label} />;
                    })}
                  </Box>
                )}
              >
                {MCP_SERVERS.map((srv) => (
                  <MenuItem key={srv.value} value={srv.value}>
                    {srv.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.servers && (
            <Typography color="error" variant="caption">
              {errors.servers.message as string}
            </Typography>
          )}
        </FormControl>
        <Button type="submit" variant="contained" color="primary">
          Save Selection
        </Button>
      </form>
      {submitted && (
        <Box mt={3}>
          <Typography variant="subtitle1">Selected:</Typography>
          <Typography variant="body2">
            Directory: <b>{submitted.directory}</b>
            <br />
            MCP Servers:{" "}
            <pre style={{ display: "inline", whiteSpace: "pre-wrap" }}>
              {JSON.stringify(submitted.servers, null, 2)}
            </pre>
          </Typography>
        </Box>
      )}
    </>
  );
};

export default McpServers;