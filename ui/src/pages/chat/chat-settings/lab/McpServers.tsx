import { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
  { label: "Web Scrapper Server", value: "webscrapper" },
  // Add more as needed
];

const schema = Joi.object({
  directory: Joi.string().required().label("MCP Server Directory"),
  server: Joi.string().required().label("MCP Server"),
  functions: Joi.array().items(
    Joi.object({
      name: Joi.string().min(2).required().label("Function Name"),
      params: Joi.array().items(
        Joi.object({
          param: Joi.string().min(1).required().label("Parameter Name"),
        })
      ),
    })
  ),
});

type ParamType = { param: string };
type FunctionType = { name: string; params: ParamType[] };
type FormValues = {
  directory: string;
  server: string;
  functions: FunctionType[];
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
      server: MCP_SERVERS[0].value,
      functions: [{ name: "", params: [{ param: "" }] }],
    },
  });

  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const onSubmit = (data: FormValues) => {
    setSubmitted(data);
  };

  return (
    <>
      <Typography variant="h6" className="mb-3">
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
          <InputLabel>MCP Server</InputLabel>
          <Controller
            name="server"
            control={control}
            render={({ field }) => (
              <Select {...field} label="MCP Server">
                {MCP_SERVERS.map((srv) => (
                  <MenuItem value={srv.value} key={srv.value}>
                    {srv.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.server && (
            <Typography color="error" variant="caption">
              {errors.server.message as string}
            </Typography>
          )}
        </FormControl>
      </form>
      {submitted && (
        <Box mt={3}>
          <Typography variant="subtitle1">Selected:</Typography>
          <Typography variant="body2">
            Directory: <b>{submitted.directory}</b>
            <br />
            MCP Server: <b>{submitted.server}</b>
            <br />
            Functions:{" "}
            <pre style={{ display: "inline", whiteSpace: "pre-wrap" }}>
              {JSON.stringify(submitted.functions, null, 2)}
            </pre>
          </Typography>
        </Box>
      )}
    </>
  );
};

export default McpServers;