import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import {
  MenuItem,
  Button,
  InputLabel,
  Select,
  FormControl
} from "@mui/material";

const schema = Joi.object({
  format: Joi.string().valid("pdf", "excel").required(),
  schedule: Joi.string().valid("none", "daily", "weekly", "monthly").required(),
});

const formats = [
  { label: "PDF", value: "pdf" },
  { label: "Excel", value: "excel" },
];

const schedules = [
  { label: "None", value: "none" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const ChatReportSettings = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: joiResolver(schema),
    defaultValues: {
      format: "pdf",
      schedule: "none",
    },
  });

  const onSubmit = (data: any) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <FormControl fullWidth>
              <InputLabel>Report Format</InputLabel>
              <Controller
                name="format"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Report Format" error={!!errors.format}>
                    {formats.map((f) => (
                      <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </div>
          <div className="col-md-6 mb-3">
            <FormControl fullWidth>
              <InputLabel>Schedule</InputLabel>
              <Controller
                name="schedule"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Schedule" error={!!errors.schedule}>
                    {schedules.map((s) => (
                      <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </div>
          <div className="col-12">
            <Button type="submit" variant="contained" color="primary">
              Save Report Settings
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default ChatReportSettings;
