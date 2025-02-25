import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Button, Dialog } from "@radix-ui/themes";
import { router } from "../../../../main";

export const Route = createFileRoute("/protected/notifications/$notificationId/delete")({
  component: DeleteNotificationPage,
});

function DeleteNotificationPage() {
  const { notificationId } = Route.useParams();
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const data = await fbFunctions.getNotificationById(notificationId);
        setNotification(data);
      } catch (error) {
        console.error("Failed to load notification", error);
      }
    };
    fetchNotification();
  }, [notificationId]);

  const handleDelete = async () => {
    await fbFunctions.deleteNotificationById(notificationId);
    router.history.push("/protected/notifications");
  };

  if (!notification) return <p>Loading...</p>;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Title>Delete Notification</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete this notification?
          <br />
          <strong>Title:</strong> {notification.title}
          <br />
          <strong>Body:</strong> {notification.body}
        </Dialog.Description>
        <div className="flex justify-end gap-2 mt-4">
          <Button color="red" onClick={handleDelete}>
            Yes, Delete
          </Button>
          <Button onClick={() => router.history.push("/protected/notifications")}>No</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
