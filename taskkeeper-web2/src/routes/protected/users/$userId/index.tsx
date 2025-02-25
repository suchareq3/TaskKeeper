import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { Timestamp } from "firebase/firestore";
import { DataList } from "@radix-ui/themes";

export const Route = createFileRoute("/protected/users/$userId/")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { userId } = useParams({ from: "/protected/users/$userId/" });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await fbFunctions.getUserById(userId);
        console.log("User data:", userData);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">
        {user.first_name} {user.last_name}
      </h1>
      <DataList.Root size={"3"}>
        <DataList.Item>
          <DataList.Label color="indigo">ID</DataList.Label>
          <DataList.Value>{user.id}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label color="indigo">Date of Birth</DataList.Label>
          <DataList.Value>{new Timestamp(user.date_of_birth.seconds, user.date_of_birth.nanoseconds).toDate().toUTCString()}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label color="indigo">Created On</DataList.Label>
          <DataList.Value>{new Timestamp(user.created_on.seconds, user.created_on.nanoseconds).toDate().toUTCString()}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label color="indigo">Last Updated On</DataList.Label>
          <DataList.Value>{new Timestamp(user.last_updated_on.seconds, user.last_updated_on.nanoseconds).toDate().toUTCString()}</DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </div>
  );
}
