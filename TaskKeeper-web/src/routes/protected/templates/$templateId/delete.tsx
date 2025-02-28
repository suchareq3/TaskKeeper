import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Button, Dialog, Text } from "@radix-ui/themes";
import { router } from "../../../../main";

export const Route = createFileRoute("/protected/templates/$templateId/delete")({
  component: DeleteTemplatePage,
});

function DeleteTemplatePage() {
  const { templateId } = Route.useParams();
  const [template, setTemplate] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        // Get all templates and find the one with matching ID
        const templates = await fbFunctions.getAllTemplates();
        const foundTemplate = templates.find((t: any) => t.id === templateId);
        
        if (foundTemplate) {
          setTemplate(foundTemplate);
        } else {
          setError("Template not found");
        }
      } catch (err) {
        console.error("Failed to load template", err);
        setError("Failed to load template");
      }
    };
    
    fetchTemplate();
  }, [templateId]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await fbFunctions.handleDelete(templateId);
      router.history.push("/protected/templates");
    } catch (err) {
      console.error("Error deleting template:", err);
      setError("Failed to delete template: " + (err.message || "Unknown error"));
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    router.history.push("/protected/templates");
  };

  if (error) {
    return (
      <div className="p-4">
        <Text color="red" size="5">Error: {error}</Text>
        <Button onClick={handleCancel} className="mt-4">Back to Templates</Button>
      </div>
    );
  }

  if (!template) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Content>
        <Dialog.Title>Delete Template</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete the template{" "}
          <strong>
            {template.name}
          </strong>
          ? This action cannot be undone.
        </Dialog.Description>
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            color="red" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
          <Button onClick={handleCancel} disabled={isDeleting}>Cancel</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
