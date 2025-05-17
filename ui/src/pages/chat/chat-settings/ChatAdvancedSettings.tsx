import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import {
  Box,
  MenuItem,
  Button,
  InputLabel,
  Select,
  FormControl
} from "@mui/material";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import moment from "moment-timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const schema = Joi.object({
  timezone: Joi.string().required(),
});

const timezones = moment.tz.names();

const ChatAdvancedSettings = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(schema),
    defaultValues: {
      timezone: dayjs.tz.guess(),
    },
  });

  const handleDeleteAll = () => {
    // Add your delete logic here
    alert("All chat deleted!");
  };

  const onSubmit = (data: any) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Time Zone</InputLabel>
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <Select {...field} label="Time Zone" error={!!errors.timezone}>
                {timezones.map((tz: any) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          sx={{ fontWeight: 600, mb: 2 }}
        >
          Save Advanced Settings
        </Button>
      </form>
      <Button
        variant="outlined"
        color="error"
        onClick={handleDeleteAll}
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Delete All Chat
      </Button>
    </Box>
  );
};

export default ChatAdvancedSettings;
