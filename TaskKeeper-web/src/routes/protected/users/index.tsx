// src/routes/users/route.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";
import { UserTable } from "../../../components/UserTable";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { format } from "date-fns";
import { Button } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";
import { router } from "../../../main";

export const Route = createFileRoute("/protected/users/")({
  component: UsersPage,
  loader: async () => {
    const users = await fbFunctions.getAllUsers();
    return { users };
  },
});

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await fbFunctions.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users", error);
      }
    };
    fetchUsers();
  }, []);

  // TypeScript type for user data
  type User = {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    created_on: Timestamp;
    last_updated_on: Timestamp;
    fcm_token: string;
  };

  const columns = [
    { headerName: "ID", field: "id", filter: true },
    { headerName: "First Name", field: "first_name", filter: true },
    { headerName: "Last Name", field: "last_name", filter: true },
    {
      headerName: "Date of Birth",
      field: "date_of_birth",
      filter: "agDateColumnFilter",
      valueFormatter: (params: any) => new Timestamp(params.value?.seconds, params.value?.nanoseconds).toDate(),
    },
    {
      headerName: "Created On",
      field: "created_on",
      filter: "agDateColumnFilter",
      valueFormatter: (params: any) => new Timestamp(params.value?.seconds, params.value?.nanoseconds).toDate(),
    },
    {
      headerName: "Last Updated On",
      field: "last_updated_on",
      filter: "agDateColumnFilter",
      valueFormatter: (params: any) => new Timestamp(params.value?.seconds, params.value?.nanoseconds).toDate(),
    },
    {
      headerName: "Actions",
      field: "id",
      minWidth: 220,
      cellRenderer: (params: any) => (
        <div className="flex flex-row gap-2 items-center h-full">
          <Button>
            <Link to={`/protected/users/${params.value}`}>View</Link>
          </Button>
          <Button>
            <Link to={`/protected/users/${params.value}/edit`}>Edit</Link>
          </Button>
          <Button>
            <Link to={`/protected/users/${params.value}/delete`}>Delete</Link>
          </Button>
        </div>
      ),
    },
  ];

  // Function to export data as CSV
  const onExportCSV = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv();
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <Button className="mb-2" onClick={() => router.history.push("/protected/users/new")}>
        New
      </Button>
      <Button className="!ml-2" onClick={onExportCSV}>
        Export CSV
      </Button>
      <div className="ag-theme-alpine my-5" style={{ height: 500, width: "100%" }}>
        <AgGridReact ref={gridRef} rowData={users} columnDefs={columns} pagination={true} />
      </div>
    </div>
  );
}
