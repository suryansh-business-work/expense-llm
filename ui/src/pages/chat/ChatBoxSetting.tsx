import { FormControlLabel, Switch, Paper } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";

const schema = Joi.object({
  useChatHistory: Joi.boolean().required(),
});

type ChatBotSettingForm = {
  useChatHistory: boolean;
};

export default function ChatBotSetting() {
  const { control } = useForm<ChatBotSettingForm>({
    defaultValues: { useChatHistory: true },
    resolver: joiResolver(schema),
  });

  return (
    <Paper
      className="ps-3"
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
