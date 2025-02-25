import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Button, Dialog, Text } from "@radix-ui/themes";

export const Route = createFileRoute("/protected/users/$userId/delete")({
  component: DeleteUserPage,
});

function DeleteUserPage() {
  const { userId } = useParams({ from: "/protected/users/$userId/delete" });
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await fbFunctions.getUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleDelete = async () => {
    try {
      await fbFunctions.deleteUserById(userId).then((res) => console.log(res));
      router.history.push("/protected/users"); // Redirect after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Content>
        <Dialog.Title>Confirm Deletion</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete user{" "}
          <strong>
            {user.first_name} {user.last_name} (ID: {user.id})
          </strong>
          ?
        </Dialog.Description>
        <div className="flex justify-end gap-2 mt-4">
          <Button color="red" onClick={handleDelete}>
            Yes, Delete
          </Button>
          <Button onClick={() => router.history.push("/protected/users")}>No</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
