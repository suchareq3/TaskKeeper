import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Button, Text, Heading, Card, Select } from "@radix-ui/themes";
import { router } from "../../../../main";
import { AgGridReact } from "ag-grid-react";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

export const Route = createFileRoute("/protected/templates/$templateId/fill")({
  component: FillTemplatePage,
});

interface Template {
  id: string;
  name: string;
  table: string;
  createdAt: Date;
  fields: string[];
  storagePath: string;
}

function FillTemplatePage() {
  const { templateId } = Route.useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Get template details
        const templates = await fbFunctions.getAllTemplates();
        const foundTemplate = templates.find((t: any) => t.id === templateId);
        
        if (!foundTemplate) {
          setError("Template not found");
          return;
        }
        
        console.log("Found template:", foundTemplate);
        setTemplate(foundTemplate);
        
        // 2. Get records for the template's table
        const tableRecords = await fbFunctions.getAllTableRecords(foundTemplate.table);
        console.log(`Loaded ${tableRecords.length} records from table ${foundTemplate.table}`);
        setRecords(tableRecords);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [templateId]);

  const handleFillTemplate = async () => {
    if (!template || !selectedRecord) return;
    
    try {
      setProcessing(true);
      setError(null);
      
      // 1. Download template file
      if (!template.storagePath) {
        throw new Error("Template storage path is missing");
      }
      
      console.log("Using storage path:", template.storagePath);
      const downloadUrl = await fbFunctions.getDownloadUrlForPath(template.storagePath);
      console.log("Download URL obtained:", downloadUrl);
      
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch template file: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log("Template file downloaded, size:", arrayBuffer.byteLength);
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error("Downloaded file is empty");
      }
      
      // 2. Process template
      try {
        const zip = new PizZip(arrayBuffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });
        
        // 3. Prepare data for docxtemplater
        // Only include fields that are in the template's fields array
        const data: Record<string, any> = {};
        
        // Add only the fields that are included in the template
        template.fields.forEach(field => {
          if (field in selectedRecord) {
            // Handle special cases like dates and timestamps
            const value = selectedRecord[field];
            
            // Check if it's a timestamp (has seconds property)
            if (value && typeof value === 'object' && 'seconds' in value) {
              data[field] = formatDate(value);
            } 
            // Check if it's a Date object
            else if (value instanceof Date) {
              data[field] = formatDate(value);
            }
            // For all other fields, use as is
            else {
              data[field] = value;
            }
          }
        });
        
        doc.setData(data);
        doc.render();
        
        // 4. Generate and download
        const out = doc.getZip().generate({
          type: "blob",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        
        saveAs(out, `${template.name}_${selectedRecord.id}_filled.docx`);
      } catch (err) {
        console.error("Error processing template:", err);
        setError("Error generating document: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error filling template:", err);
      setError("Error filling template: " + (err.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    // Handle Firebase Timestamp objects
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    
    // Handle JavaScript Date objects
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    
    // Try to parse string dates
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return String(timestamp);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <Text color="red" size="5">Error: {error}</Text>
        {template && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <Heading size="4">Template Debug Info:</Heading>
            <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto">
              {JSON.stringify(template, (key, value) => {
                // Format timestamps in the debug output
                if (value && typeof value === 'object' && 'seconds' in value) {
                  return `Timestamp: ${formatDate(value)}`;
                }
                return value;
              }, 2)}
            </pre>
          </div>
        )}
        <Button onClick={() => router.history.push("/protected/templates")} className="mt-4">
          Back to Templates
        </Button>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-4">
        <Text color="red" size="5">Template not found</Text>
        <Button onClick={() => router.history.push("/protected/templates")} className="mt-4">
          Back to Templates
        </Button>
      </div>
    );
  }

  // Define columns for the records grid
  const columns = [
    { headerName: "ID", field: "id", width: 220 },
    ...(records.length > 0 
      ? Object.keys(records[0])
          .filter(key => key !== "id" && template.fields.includes(key))
          .map(key => ({
            headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            field: key,
            flex: 1,
            valueFormatter: (params: any) => {
              const value = params.value;
              
              // Format timestamps and dates
              if (value && typeof value === 'object') {
                // Firebase Timestamp
                if ('seconds' in value) {
                  return formatDate(value);
                }
                // Date object
                if (value instanceof Date) {
                  return formatDate(value);
                }
              }
              
              return value;
            }
          }))
      : [])
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <div>
          <Heading size="6">Fill Template: {template.name}</Heading>
          <Text size="2" color="gray">
            For table: {template.table} | Fields: {template.fields.join(", ")}
          </Text>
          <Text size="2" color="gray">
            Storage path: {template.storagePath || "Not available"}
          </Text>
        </div>
        <Button onClick={() => router.history.push("/protected/templates")}>
          Back to Templates
        </Button>
      </div>

      <Card className="mb-4 p-4">
        <Heading size="4" className="mb-2">Select a Record</Heading>
        <Text size="2" color="gray" className="mb-4">
          Select a record from the {template.table} table to fill the template with.
        </Text>

        <div className="ag-theme-alpine" style={{ height: 400 }}>
          <AgGridReact
            rowData={records}
            columnDefs={columns}
            pagination={true}
            paginationPageSize={10}
            rowSelection="single"
            onSelectionChanged={(event) => {
              const selectedRows = event.api.getSelectedRows();
              setSelectedRecord(selectedRows.length > 0 ? selectedRows[0] : null);
            }}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button 
          color="green" 
          disabled={!selectedRecord || processing}
          onClick={handleFillTemplate}
        >
          {processing ? "Processing..." : "Fill & Download Template"}
        </Button>
      </div>
    </div>
  );
}
