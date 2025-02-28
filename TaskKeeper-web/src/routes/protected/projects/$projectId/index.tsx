import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { DataList } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";

export const Route = createFileRoute("/protected/projects/$projectId/")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectData = await fbFunctions.getProjectById(projectId);
        setProject(projectData);

        // Fetch user details for each member UID
        const memberUids = Object.keys(projectData.members || {});
        const userPromises = memberUids.map(uid => fbFunctions.getUserById(uid));
        const users = await Promise.all(userPromises);

        // Map member UIDs to their user details
        const memberList = users.map((user, index) => ({
          uid: memberUids[index],
          firstName: user?.first_name || "Unknown",
          lastName: user?.last_name || "Unknown",
          isManager: projectData.members[memberUids[index]].isManager,
        }));

        setMembers(memberList);
      } catch (error) {
        console.error("Failed to load project details", error);
      }
    };

    fetchProject();
  }, [projectId]);

  if (!project) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <p>{project.description}</p>

      <DataList.Root>
        <DataList.Item>
          <DataList.Label>Project ID</DataList.Label>
          <DataList.Value>{projectId}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>GitHub URL</DataList.Label>
          <DataList.Value>{project.github_url || "N/A"}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Invite Code</DataList.Label>
          <DataList.Value>{project.invite_code}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Created On</DataList.Label>
          <DataList.Value>{new Timestamp(project.created_on.seconds, project.created_on.nanoseconds).toDate().toUTCString()}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Last Updated On</DataList.Label>
          <DataList.Value>{new Timestamp(project.last_updated_on.seconds, project.last_updated_on.nanoseconds).toDate().toUTCString()}</DataList.Value>
        </DataList.Item>
      </DataList.Root>

      <h2 className="text-xl font-bold mt-6">Members</h2>
      <ul className="mt-2">
        {members.length > 0 ? (
          members.map((member) => (
            <li key={member.uid} className="border p-2 rounded mb-2">
              <p>
                <strong>UID:</strong> {member.uid}
              </p>
              <p>
                <strong>Name:</strong> {member.firstName} {member.lastName}
              </p>
              <p>
                <strong>Role:</strong> {member.isManager ? "Manager" : "Member"}
              </p>
            </li>
          ))
        ) : (
          <p>No members found.</p>
        )}
      </ul>
    </div>
  );
}
