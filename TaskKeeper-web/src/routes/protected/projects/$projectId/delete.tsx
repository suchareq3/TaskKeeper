import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Button, Dialog } from "@radix-ui/themes";
import { router } from "../../../../main";

export const Route = createFileRoute("/protected/projects/$projectId/delete")({
  component: DeleteProjectPage,
});

function DeleteProjectPage() {
  const { projectId } = Route.useParams();
  const [project, setProject] = useState(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await fbFunctions.getProjectById(projectId);
        setProject(data);
      } catch (error) {
        console.error("Failed to load project", error);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleDelete = async () => {
    await fbFunctions.deleteProject(projectId);
    router.history.push("/protected/projects");
  };

  if (!project) return <p>Loading...</p>;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Title>Delete Project</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete the project{" "}
          <strong>
            {project.name} (ID: {project.id})
          </strong>
          ?
        </Dialog.Description>
        <div className="flex justify-end gap-2 mt-4">
          <Button color="red" onClick={handleDelete}>
            Yes, Delete
          </Button>
          <Button onClick={() => router.history.push("/protected/projects")}>No</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
