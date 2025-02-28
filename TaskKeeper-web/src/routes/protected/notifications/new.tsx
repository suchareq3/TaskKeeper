import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";
import { TextField, Button, Select } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";

export const Route = createFileRoute("/protected/notifications/new")({
  component: NewNotificationPage,
});

function NewNotificationPage() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    title: "",
    body: "",
    user_uids: [],
    created_on: Timestamp.now(),
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await fbFunctions.getAllUsers(); // Make sure this function exists
        setUsers(userList);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSave = async () => {
    if (!notification.title || !notification.body || notification.user_uids.length === 0) {
      alert("Please fill in all fields and select a user.");
      return;
    }
    await fbFunctions.createCustomNotification(notification.title, notification.body, notification.user_uids);
    navigate({ to: "/protected/notifications" });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">New Notification</h1>

      {/* User Selection */}
      <Select.Root value={notification.user_uids[0] || ""} onValueChange={(value) => setNotification({ ...notification, user_uids: [value] })}>
        <Select.Trigger placeholder="Select a user" />
        <Select.Content>
          {users.map((user) => (
            <Select.Item key={user.id} value={user.id}>
              {user.first_name} {user.last_name} ({user.id})
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      {/* Title Input */}
      <TextField.Root type="text" placeholder="Notification Title" onChange={(e) => setNotification({ ...notification, title: e.target.value })} />

      {/* Body Input */}
      <TextField.Root type="text" placeholder="Notification Body" onChange={(e) => setNotification({ ...notification, body: e.target.value })} />

      {/* Submit Button */}
      <Button onClick={handleSave}>Send Notification</Button>
    </div>
  );
}
