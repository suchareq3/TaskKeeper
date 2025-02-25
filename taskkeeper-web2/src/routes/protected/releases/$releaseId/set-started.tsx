import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Button, Dialog } from "@radix-ui/themes";
import { router } from "../../../../main";

export const Route = createFileRoute("/protected/releases/$releaseId/set-started")({
  component: SetReleaseStartedPage,
});

function SetReleaseStartedPage() {
  const { releaseId } = Route.useParams();
  const [release, setRelease] = useState({project_id: "", name: ""});
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

  const handleSetStarted = async () => {
    try {
      await fbFunctions.startRelease(releaseId, release.project_id);
      router.history.push(`/protected/releases/${releaseId}`);
    } catch (error) {
      console.error("Failed to update release status", error);
    }
  };

  if (!release) return <p>Loading...</p>;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Title>Set Release to Started</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to set the status of release{" "}
          <strong>
            {release.name} (ID: {releaseId})
          </strong>{" "}
          to <strong>started</strong>?
        </Dialog.Description>
        <div className="flex justify-end gap-2 mt-4">
          <Button color="blue" onClick={handleSetStarted}>
            Yes, Set as Started
          </Button>
          <Button onClick={() => router.history.push(`/protected/releases/${releaseId}`)}>No</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
