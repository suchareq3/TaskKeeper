import { createFileRoute, Link } from "@tanstack/react-router";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";
import { useCallback, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";
import { router } from "../../../main";

export const Route = createFileRoute("/protected/tasks/")({
  component: TasksPage,
  loader: async () => {
    const tasks = await fbFunctions.getAllTasks();
    return { tasks };
  },
});

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await fbFunctions.getAllTasks();
        setTasks(data);
      } catch (error) {
        console.error("Failed to load tasks", error);
      }
    };
    fetchTasks();
  }, []);

  // TypeScript type for task data
  type Task = {
    id: string;
    task_name: string;
    task_description: string;
    task_status: string;
    task_type: string;
    project_id: string;
    task_assignee_uid: string;
    priority_level: number;
    created_on: Timestamp;
    last_updated_on: Timestamp;
    subtasks: { completed: boolean; key: string; label: string }[];
  };

  const columns = [
    { headerName: "ID", field: "id", filter: true },
    { headerName: "Task Name", field: "task_name", filter: true },
    { headerName: "Description", field: "task_description", filter: true },
    { headerName: "Status", field: "task_status", filter: true },
    { headerName: "Type", field: "task_type", filter: true },
    { headerName: "Project ID", field: "project_id", filter: true },
    { headerName: "Assigned User", field: "task_assignee_uid", filter: true },
    { headerName: "Priority", field: "priority_level", filter: true },
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
      headerName: "Total Subtasks",
      field: "subtasks",
      valueFormatter: (params: any) => params.value?.length || 0,
    },
    {
      headerName: "Completed Subtasks",
      field: "subtasks",
      valueFormatter: (params: any) => params.value?.filter((s: { completed: boolean }) => s.completed).length || 0,
    },
    {
      headerName: "Actions",
      field: "id",
      minwidth: 400,
      cellRenderer: (params: any) => (
        <div className="flex flex-row gap-2 items-center h-full">
          <Button>
            <Link to={`/protected/tasks/${params.value}`}>View</Link>
          </Button>
          <Button>
            <Link to={`/protected/tasks/${params.value}/edit`}>Edit</Link>
          </Button>
          <Button>
            <Link to={`/protected/tasks/${params.value}/delete`}>Delete</Link>
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
      <h1 className="text-2xl font-bold mb-4">Task Management</h1>
      <Button className="mb-2" onClick={() => router.history.push("/protected/tasks/new")}>
        New
      </Button>
      <Button className="!ml-2" onClick={onExportCSV}>
        Export CSV
      </Button>
      <div className="ag-theme-alpine my-5" style={{ height: 500, width: "100%" }}>
        <AgGridReact ref={gridRef} rowData={tasks} columnDefs={columns} pagination={true} />
      </div>
    </div>
  );
}
