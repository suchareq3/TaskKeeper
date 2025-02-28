import { createFileRoute, Link } from "@tanstack/react-router";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";
import { useCallback, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { format, min } from "date-fns";
import { Button } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";
import { router } from "../../../main";

export const Route = createFileRoute("/protected/projects/")({
  component: ProjectsPage,
  loader: async () => {
    const projects = await fbFunctions.getAllProjects();
    return { projects };
  },
});

function ProjectsPage() {
  const gridRef = useRef(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await fbFunctions.getAllProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects", error);
      }
    };
    fetchProjects();
  }, []);

  // TypeScript type for project data
  type Project = {
    id: string;
    name: string;
    description: string;
    github_url: string;
    invite_code: string;
    created_on: Timestamp;
    last_updated_on: Timestamp;
    members: Record<string, { isManager: boolean }>;
  };

  const columns = [
    { headerName: "ID", field: "id", filter: true },
    { headerName: "Name", field: "name", filter: true },
    { headerName: "Description", field: "description", filter: true },
    {
      headerName: "GitHub URL",
      field: "github_url",
      cellRenderer: (params: any) => (
        <a href={params.value} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          {params.value}
        </a>
      ),
    },
    { headerName: "Invite Code", field: "invite_code" },
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
      headerName: "Members",
      field: "members",
      valueFormatter: (params: any) => Object.keys(params.value || {}).length + " members",
    },
    {
      headerName: "Actions",
      field: "id",
      minWidth: 320,
      cellRenderer: (params: any) => (
        <div className="flex flex-row gap-2 items-center h-full">
          <Button>
            <Link to={`/protected/projects/${params.value}`}>View</Link>
          </Button>
          <Button>
            <Link to={`/protected/projects/${params.value}/edit`}>Edit</Link>
          </Button>
          <Button>
            <Link to={`/protected/projects/${params.value}/delete`}>Delete</Link>
          </Button>
          <Button>
            <Link to={`/protected/projects/${params.value}/refresh-invite`}>Refresh inv</Link>
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
      <h1 className="text-2xl font-bold mb-4">Project Management</h1>
      <Button className="mb-2" onClick={() => router.history.push("/protected/projects/new")}>
        New
      </Button>
      <Button className="!ml-2" onClick={onExportCSV}>
        Export CSV
      </Button>
      <div className="ag-theme-alpine my-5" style={{ height: 500, width: "100%" }}>
        <AgGridReact ref={gridRef} rowData={projects} columnDefs={columns} pagination={true} />
      </div>
    </div>
  );
}
