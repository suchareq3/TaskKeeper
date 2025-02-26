import { Dialog, Button } from "@radix-ui/themes";

export const RecordSelectDialog = ({ 
  table,
  records,
  onSelect,
  onCancel 
}: {
  table: string;
  records: any[];
  onSelect: (record: any) => void;
  onCancel: () => void;
}) => {
  return (
    <Dialog.Root open={true}>
      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>Select {table} Record</Dialog.Title>
        
        <div className="max-h-96 overflow-y-auto my-4">
          {records.map(record => (
            <div 
              key={record.id}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b"
              onClick={() => onSelect(record)}
            >
              <div className="font-medium">{record.title || record.name}</div>
              <div className="text-sm text-gray-600">
                ID: {record.id} | Created: {formatDate(record.created_on)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="soft" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

// Helper function
const formatDate = (timestamp: any) => {
  return new Date(timestamp?.seconds * 1000).toLocaleDateString();
};