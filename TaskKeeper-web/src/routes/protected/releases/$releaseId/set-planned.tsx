import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Button, Dialog } from "@radix-ui/themes";
import { router } from "../../../../main";

export const Route = createFileRoute("/protected/releases/$releaseId/set-planned")({
  component: ResetReleaseStatusPage,
});

function ResetReleaseStatusPage() {
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

  const handleResetStatus = async () => {
    try {
      await fbFunctions.revertRelease(releaseId);
      router.history.push(`/protected/releases/${releaseId}`);
    } catch (error) {
      console.error("Failed to reset release status", error);
    }
  };

  if (!release) return <p>Loading...</p>;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Title>Reset Release Status</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to reset the status of release{" "}
          <strong>
            {release.name} (ID: {releaseId})
          </strong>{" "}
          to <strong>planned</strong>?
        </Dialog.Description>
        <div className="flex justify-end gap-2 mt-4">
          <Button color="blue" onClick={handleResetStatus}>
            Yes, Reset
          </Button>
          <Button onClick={() => router.history.push(`/protected/releases/${releaseId}`)}>No</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
