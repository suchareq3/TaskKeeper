import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Button, Dialog } from "@radix-ui/themes";
import { router } from "../../../../main";

export const Route = createFileRoute("/protected/tasks/$taskId/delete")({
  component: DeleteTaskPage,
});

function DeleteTaskPage() {
  const { taskId } = Route.useParams();
  const [task, setTask] = useState(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await fbFunctions.getTaskById(taskId);
        setTask(data);
      } catch (error) {
        console.error("Failed to load task", error);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleDelete = async () => {
    await fbFunctions.deleteTask(taskId);
    router.history.push("/protected/tasks");
  };

  if (!task) return <p>Loading...</p>;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Title>Delete Task</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete the task{" "}
          <strong>
            {task.task_name} (ID: {taskId})
          </strong>
          ? This will also delete all subtasks associated with this task!
        </Dialog.Description>
        <div className="flex justify-end gap-2 mt-4">
          <Button color="red" onClick={handleDelete}>
            Confirm Delete
          </Button>
          <Button onClick={() => router.history.push("/protected/tasks")}>Cancel</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
