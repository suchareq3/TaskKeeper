import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Button, Dialog } from "@radix-ui/themes";
import { router } from "../../../../main";

export const Route = createFileRoute("/protected/releases/$releaseId/delete")({
  component: DeleteReleasePage,
});

function DeleteReleasePage() {
  const { releaseId } = Route.useParams();
  const [release, setRelease] = useState(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const data = await fbFunctions.getReleaseById(releaseId);
        setRelease(data);
      } catch (error) {
        console.error("Failed to load release", error);
      }
    };
    fetchRelease();
  }, [releaseId]);

  const handleDelete = async () => {
    await fbFunctions.deleteReleaseWithTasks(releaseId);
    router.history.push("/protected/releases");
  };

  if (!release) return <p>Loading...</p>;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Title>Delete Release & its tasks?</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete the release{" "}
          <strong>
            {release.name} (ID: {releaseId})
          </strong>
          ? This will also delete all tasks associated with this release!
        </Dialog.Description>
        <div className="flex justify-end gap-2 mt-4">
          <Button color="red" onClick={handleDelete}>
            Yes, Delete
          </Button>
          <Button onClick={() => router.history.push("/protected/releases")}>No</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
