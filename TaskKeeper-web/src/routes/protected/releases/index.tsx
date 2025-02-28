import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";
import { AgGridReact } from "ag-grid-react";
import { Timestamp } from "firebase/firestore";
import { Button } from "@radix-ui/themes";
import { router } from "../../../main";

export const Route = createFileRoute("/protected/releases/")({
  component: ReleasesPage,
  loader: async () => {
    const releases = await fbFunctions.getAllReleases();
    return { releases };
  },
});

function ReleasesPage() {
  const [releases, setReleases] = useState([]);
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const data = await fbFunctions.getAllReleases();
        setReleases(data);
      } catch (error) {
        console.error("Failed to load releases", error);
      }
    };
    fetchReleases();
  }, []);

  const columns = [
    { headerName: "Project ID", field: "projectId", filter: true },
    { headerName: "ID", field: "releaseId", filter: true },
    { headerName: "Name", field: "name", filter: true },
    { headerName: "Status", field: "status", filter: true },
    {
      headerName: "Start Date",
      field: "startDate",
      filter: "agDateColumnFilter",
      valueFormatter: (params: any) => (params.value ? new Timestamp(params.value.seconds, params.value.nanoseconds).toDate() : null),
    },
    {
      headerName: "Created On",
      field: "createdOn",
      filter: "agDateColumnFilter",
      valueFormatter: (params: any) => (params.value ? new Timestamp(params.value.seconds, params.value.nanoseconds).toDate() : null),
    },
    {
      headerName: "Last Updated On",
      field: "lastUpdatedOn",
      filter: "agDateColumnFilter",
      valueFormatter: (params: any) => (params.value ? new Timestamp(params.value.seconds, params.value.nanoseconds).toDate() : null),
    },
    {
      headerName: "Actions",
      field: "releaseId",
      minWidth: 460,
      cellRenderer: (params: any) => (
        <div className="flex flex-row gap-2 items-center h-full w-full">
          <Button>
            <Link to={`/protected/releases/${params.value}`}>View</Link>
          </Button>
          <Button>
            <Link to={`/protected/releases/${params.value}/edit`}>Edit</Link>
          </Button>
          <Button>
            <Link to={`/protected/releases/${params.value}/delete`}>Delete</Link>
          </Button>
          <Button>
            <Link to={`/protected/releases/${params.value}/set-started`}>Start</Link>
          </Button>
          <Button>
            <Link to={`/protected/releases/${params.value}/set-finished`}>Finish</Link>
          </Button>
          <Button>
            <Link to={`/protected/releases/${params.value}/set-planned`}>Set to Planned</Link>
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
      <h1 className="text-2xl font-bold mb-4">Release Management</h1>
      <Button className="mb-2" onClick={() => router.history.push("/protected/releases/new")}>
        New
      </Button>
      <Button className="!ml-2" onClick={onExportCSV}>
        Export CSV
      </Button>
      <div className="ag-theme-alpine my-5" style={{ height: 500, width: "100%" }}>
        <AgGridReact ref={gridRef} rowData={releases} columnDefs={columns} pagination={true} />
      </div>
    </div>
  );
}
