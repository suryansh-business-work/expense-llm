import { Typography, Paper } from "@mui/material";
import Table from "./design-system/components/Table";
import Button from "./design-system/components/Button";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "age", label: "Age", sortable: true },
  { key: "actions", label: "Actions", render: () => <Button size="small">Edit</Button> },
];

const data = Array.from({ length: 100 }, (_, i) => ({
  name: `User ${i + 1}`,
  age: 20 + (i % 30),
}));

export default function UsersList() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        All Users
      </Typography>
      <Table columns={columns} data={data} />
    </Paper>
  );
}
