import { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

const schema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
});

interface ShareUser {
  email: string;
  status: "active" | "revoked";
}

const ChatShareSettings = () => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: joiResolver(schema),
    defaultValues: { email: "" },
  });

  const [sharedUsers, setSharedUsers] = useState<ShareUser[]>([]);

  const onSubmit = (data: { email: string }) => {
    if (!sharedUsers.some(u => u.email === data.email)) {
      setSharedUsers(prev => [...prev, { email: data.email, status: "active" }]);
      reset();
    }
  };

  const handleRevoke = (email: string) => {
    setSharedUsers(prev =>
      prev.map(u => u.email === email ? { ...u, status: "revoked" } : u)
    );
  };

  const handleDelete = (email: string) => {
    setSharedUsers(prev => prev.filter(u => u.email !== email));
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="User Email"
                error={!!errors.email}
                helperText={errors.email?.message as string}
                size="small"
                sx={{ minWidth: 260 }}
              />
            )}
          />
          <Button type="submit" variant="contained" color="primary">
            Share
          </Button>
        </Stack>
      </form>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Shared With
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sharedUsers.map((user) => (
            <TableRow key={user.email}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span style={{
                  color: user.status === "active" ? "#388e3c" : "#d32f2f",
                  fontWeight: 600,
                  textTransform: "capitalize"
                }}>
                  {user.status}
                </span>
              </TableCell>
              <TableCell align="right">
                {user.status === "active" && (
                  <IconButton
                    color="warning"
                    onClick={() => handleRevoke(user.email)}
                    title="Revoke Access"
                  >
                    <BlockIcon />
                  </IconButton>
                )}
                <IconButton
                  color="error"
                  onClick={() => handleDelete(user.email)}
                  title="Delete"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {sharedUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center">
                No users shared yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default ChatShareSettings;
