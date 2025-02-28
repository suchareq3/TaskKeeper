// src/routes/notifications/route.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";
import { router } from "../../../main";
import { format } from "date-fns";

export const Route = createFileRoute("/protected/notifications/")({
  component: NotificationsPage,
  loader: async () => {
    const notifications = await fbFunctions.getAllNotifications();
    return { notifications };
  },
});

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await fbFunctions.getAllNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };
    fetchNotifications();
  }, []);

  // TypeScript type for notification data
  type Notification = {
    id: string;
    title: string;
    body: string;
    created_on: Timestamp;
    user_uids: string[];
  };

  const columns = [
    { headerName: "Title", field: "title", filter: true, flex: 1 },
    { headerName: "Body", field: "body", filter: true, flex: 2 },
    {
      headerName: "Created On",
      field: "created_on",
      filter: "agDateColumnFilter",
      valueFormatter: (params: any) => format(new Timestamp(params.value?.seconds, params.value?.nanoseconds).toDate(), "MM/dd/yyyy HH:mm"),
      flex: 1,
    },
    {
      headerName: "Recipients",
      field: "user_uids",
      filter: true,
      valueFormatter: (params: any) => params.value?.join(", ") || "",
      flex: 2,
    },
    {
      headerName: "Actions",
      field: "id",
      minWidth: 180,
      cellRenderer: (params: any) => (
        <div className="flex flex-row gap-2 items-center h-full">
          <Button>
            <Link to={`/protected/notifications/${params.value}`}>View</Link>
          </Button>
          <Button color="red">
            <Link to={`/protected/notifications/${params.value}/delete`}>Delete</Link>
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
      <h1 className="text-2xl font-bold mb-4">Notification Management</h1>
      <Button className="mb-2" onClick={() => router.history.push("/protected/notifications/new")}>
        Create New Notification
      </Button>
      <Button className="!ml-2" onClick={onExportCSV}>
        Export CSV
      </Button>
      <div className="ag-theme-alpine my-5" style={{ height: 500, width: "100%" }}>
        <AgGridReact ref={gridRef} rowData={notifications} columnDefs={columns} pagination={true} paginationPageSize={10} />
      </div>
    </div>
  );
}
