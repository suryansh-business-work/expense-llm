import { FormControlLabel, Switch, Paper } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";

const schema = Joi.object({
  useChatHistory: Joi.boolean().required(),
});

type ChatBoxSettingForm = {
  useChatHistory: boolean;
};

export default function ChatBoxSetting() {
  const { control } = useForm<ChatBoxSettingForm>({
    defaultValues: { useChatHistory: true },
    resolver: joiResolver(schema),
  });

  return (
    <Paper
      className="ps-3"
      sx={{
        background: "#efefef",
        borderTop: "1px solid #c3c3c3",
      }}
    >
      <Controller
        name="useChatHistory"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch {...field} checked={field.value} />}
            label="Use Chat History"
          />
        )}
      />
    </Paper>
  );
}
