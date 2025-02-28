import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Timestamp } from "firebase/firestore";
import { Button, Text, TextField } from "@radix-ui/themes";
import { router } from "../../../../main";

export const Route = createFileRoute("/protected/users/$userId/edit")({
  component: EditUserPage,
});

function EditUserPage() {
  const { userId } = useParams({ from: "/protected/users/$userId/edit" });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await fbFunctions.getUserById(userId);
        setUser(userData);
        setFormData({
          id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          date_of_birth: new Timestamp(userData.date_of_birth.seconds, userData.date_of_birth.nanoseconds).toDate().toISOString().split("T")[0], // Format for <input type="date">
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fbFunctions.updateUserDetails(userId, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: Timestamp.fromDate(new Date(formData.date_of_birth)),
      });
      router.history.push(`/protected/users/${userId}`);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Edit User {formData.id}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-1/3">
        <Text>First Name</Text>
        <TextField.Root type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />

        <Text>Last Name</Text>
        <TextField.Root type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />

        <Text>Date of Birth</Text>
        <TextField.Root type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />

        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
