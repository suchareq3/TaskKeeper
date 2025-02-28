import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { DataList } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";

export const Route = createFileRoute("/protected/notifications/$notificationId/")({
  component: NotificationDetailPage,
});

function NotificationDetailPage() {
  const { notificationId } = Route.useParams();
  const [notification, setNotification] = useState(null);
  const [recipients, setRecipients] = useState([]);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const notificationData = await fbFunctions.getNotificationById(notificationId);
        setNotification(notificationData);

        // Fetch user details for each recipient UID
        const userUids = notificationData.user_uids || [];
        const userPromises = userUids.map((id) => fbFunctions.getUserById(id));
        const users = await Promise.all(userPromises);

        // Map user UIDs to their details
        const recipientList = users.map((user, index) => ({
          id: userUids[index],
          first_name: user?.first_name || "Unknown",
          last_name: user?.last_name || "Unknown",
        }));

        setRecipients(recipientList);
      } catch (error) {
        console.error("Failed to load notification details", error);
      }
    };

    fetchNotification();
  }, [notificationId]);

  if (!notification) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Notification Details</h1>

      <DataList.Root>
        <DataList.Item>
          <DataList.Label>Notification ID</DataList.Label>
          <DataList.Value>{notificationId}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Title</DataList.Label>
          <DataList.Value>{notification.title}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Body</DataList.Label>
          <DataList.Value>{notification.body}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Created On</DataList.Label>
          <DataList.Value>{new Timestamp(notification.created_on.seconds, notification.created_on.nanoseconds).toDate().toUTCString()}</DataList.Value>
        </DataList.Item>
      </DataList.Root>

      <h2 className="text-xl font-bold mt-6">Recipients</h2>
      <ul className="mt-2">
        {recipients.length > 0 ? (
          recipients.map((recipient) => (
            <li key={recipient.id} className="border p-2 rounded mb-2">
              <p>
                <strong>UID:</strong> {recipient.id}
              </p>
              <p>
                <strong>Name:</strong> {recipient.first_name} {recipient.last_name}
              </p>
            </li>
          ))
        ) : (
          <p>No recipients found.</p>
        )}
      </ul>
    </div>
  );
}
