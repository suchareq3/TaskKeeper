import { Link } from "@tanstack/react-router";
import { Button, Table, Flex } from "@radix-ui/themes";
import { format } from "date-fns"; // For date formatting
import { AgGridReact } from "ag-grid-react";

// Add TypeScript type for user data
type User = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  created_on: Date;
  last_updated_on: Date;
  fcm_token: string;
};

export function UserTable({ data }: { data: User[] }) {
  const columns = [
    { headerName: "ID", field: "id" },
    { headerName: "First Name", field: "first_name" },
    { headerName: "Last Name", field: "last_name" },
    {
      headerName: "Date of Birth",
      field: "date_of_birth",
      valueFormatter: (params: any) => format(new Date(params.value), "yyyy-MM-dd"),
    },
    {
      headerName: "Created On",
      field: "created_on",
      valueFormatter: (params: any) => format(new Date(params.value), "yyyy-MM-dd HH:mm"),
    },
    {
      headerName: "Last Updated On",
      field: "last_updated_on",
      valueFormatter: (params: any) => format(new Date(params.value), "yyyy-MM-dd HH:mm"),
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: any) => (
        <Button>
          <Link to={`/users/${params.value}`}>View</Link>
        </Button>
      ),
    },
  ];

  return (
    <div
      className="ag-theme-alpine"
      style={{ height: 500, width: "100%" }}
    >
      <AgGridReact
        rowData={data}
        columnDefs={columns}
        pagination={true}
      />
    </div>
  );
}