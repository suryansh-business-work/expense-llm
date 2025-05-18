import { Typography, TextField, Button, List, ListItem, IconButton, Stack, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

const functionSchema = Joi.object({
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

const FunctionsSection = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(functionSchema),
    defaultValues: {
      functions: [
        { name: "", params: [{ param: "" }] }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "functions",
  });

  const handleFunctionSave = (data: any) => {
    alert("Functions Saved:\n" + JSON.stringify(data.functions, null, 2));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFunctionSave)}>
      <Typography variant="h6" gutterBottom>
        Manage Functions
      </Typography>
      <List>
        {fields.map((item, idx) => (
          <ListItem key={item.id} sx={{ flexDirection: "column", alignItems: "flex-start", mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
              <Controller
                name={`functions.${idx}.name`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Function Name"
                    error={!!errors.functions?.[idx]?.name}
                    helperText={errors.functions?.[idx]?.name?.message as string}
                    sx={{ flex: 1 }}
                  />
                )}
              />
              <IconButton color="error" onClick={() => remove(idx)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
            <Box sx={{ width: "100%", mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Parameters
              </Typography>
              <FunctionParams
                nestIndex={idx}
                {...{ control, errors }}
              />
            </Box>
          </ListItem>
        ))}
      </List>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => append({ name: "", params: [{ param: "" }] })}
        sx={{ mb: 2 }}
      >
        Add Function
      </Button>
      <br />
      <Button type="submit" variant="contained">
        Save Functions
      </Button>
    </form>
  );
};

// Helper for function parameters
import { useFieldArray } from "react-hook-form";
const FunctionParams = ({ nestIndex, control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `functions.${nestIndex}.params`,
  });

  return (
    <Box>
      {fields.map((item, k) => (
        <Stack direction="row" alignItems="center" spacing={2} key={item.id} sx={{ mb: 1 }}>
          <Controller
            name={`functions.${nestIndex}.params.${k}.param`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={`Parameter ${k + 1}`}
                error={!!errors.functions?.[nestIndex]?.params?.[k]?.param}
                helperText={errors.functions?.[nestIndex]?.params?.[k]?.param?.message as string}
              />
            )}
          />
          <IconButton color="error" onClick={() => remove(k)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Button
        variant="text"
        startIcon={<AddIcon />}
        onClick={() => append({ param: "" })}
        sx={{ mt: 1 }}
      >
        Add Parameter
      </Button>
    </Box>
  );
};

export default FunctionsSection;