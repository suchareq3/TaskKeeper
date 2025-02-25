// src/routes/templates/upload/route.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button, TextField, Select } from "@radix-ui/themes";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { useEffect, useState } from "react";
import { router } from "../../../../main";

export const Route = createFileRoute("/protected/templates/upload/")({
  component: UploadTemplatePage,
});

interface TableField {
  name: string;
  type: string;
}

function UploadTemplatePage() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableFields, setTableFields] = useState<TableField[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Load available tables
  useEffect(() => {
    const loadTables = async () => {
      const data = await fbFunctions.getTables();
      setTables(data);
    };
    loadTables();
  }, []);

  // Load table fields when table is selected
  useEffect(() => {
    const loadFields = async () => {
      if (selectedTable) {
        const fields = await fbFunctions.getTableFields(selectedTable);
        setTableFields(fields);
      }
    };
    loadFields();
  }, [selectedTable]);

  // Validate form
  useEffect(() => {
    setIsValid(templateName.length > 0 && selectedTable !== "" && file !== null && selectedFields.length > 0);
  }, [templateName, selectedTable, file, selectedFields]);

  const handleUpload = async () => {
    if (!isValid || !file) return;

    const formData = new FormData();
    formData.append("name", templateName);
    formData.append("table", selectedTable);
    formData.append("file", file);
    formData.append("fields", JSON.stringify(selectedFields));

    try {
      await fbFunctions.uploadTemplate(templateName, selectedTable, selectedFields, file);
      router.history.push("/protected/templates");
    } catch (error) {
      alert("Error uploading template");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload New Template</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Template Name</label>
          <TextField.Root value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Enter template name" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">For Table</label>
          <Select.Root value={selectedTable} onValueChange={setSelectedTable}>
            <Select.Trigger placeholder="Select a table" />
            <Select.Content>
              {tables.map((table) => (
                <Select.Item key={table} value={table}>
                  {table}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        {selectedTable && (
          <div>
            <label className="block text-sm font-medium mb-2">Available Fields ({tableFields.length})</label>
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2 border rounded">
              {tableFields.map((field) => (
                <label key={field.name} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFields([...selectedFields, field.name]);
                      } else {
                        setSelectedFields(selectedFields.filter((f) => f !== field.name));
                      }
                    }}
                  />
                  <span className="font-mono">{field.name}</span>
                  <span className="text-sm text-gray-500">{field.type}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Template File (.docx)</label>
          <input
            type="file"
            accept=".docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleUpload} disabled={!isValid}>
            Upload Template
          </Button>
          <Button variant="soft" onClick={() => router.history.push("/protected/templates")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
