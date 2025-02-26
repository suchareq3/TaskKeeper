// src/routes/templates/route.tsx
import { createFileRoute } from "@tanstack/react-router";
import { AgGridReact } from "ag-grid-react";
import { Button } from "@radix-ui/themes";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";
import { useEffect, useState } from "react";
import { router } from "../../../main";

export const Route = createFileRoute("/protected/templates/")({
  component: TemplatesPage,
});

interface Template {
  id: string;
  name: string;
  table: string;
  createdAt: Date;
  fields: string[];
  storagePath: string;
}

function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);

  const columns = [
    { headerName: "Template Name", field: "name", flex: 2 },
    { headerName: "For Table", field: "table", flex: 1 },
    {
      headerName: "Fields Included",
      field: "fields",
      valueFormatter: (params: any) => params.value.join(", "),
      flex: 3,
    },
    {
      headerName: "Actions",
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button onClick={() => (params.data.storagePath ? fbFunctions.handleDownload(params.data.storagePath) : null)} disabled={!params.data.storagePath}>
            Download
          </Button>
          <Button onClick={() => router.history.push(`/protected/templates/${params.data.id}/fill`)}>Fill & Download</Button>
          <Button color="red" onClick={() => router.history.push(`/protected/templates/${params.data.id}/delete`)}>
            Delete
          </Button>
        </div>
      ),
      flex: 2,
    },
  ];

  useEffect(() => {
    const loadTemplates = async () => {
      const data = await fbFunctions.getAllTemplates();
      setTemplates(data);
    };
    loadTemplates();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Button onClick={() => router.history.push("/protected/templates/upload")}>Upload New Template</Button>
      </div>

      <div className="ag-theme-alpine" style={{ height: 600 }}>
        <AgGridReact rowData={templates} columnDefs={columns} pagination={true} paginationPageSize={10} />
      </div>
    </div>
  );
}
