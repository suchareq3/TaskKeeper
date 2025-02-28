import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { TextField, Button, DataList, Switch, Text } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";

export const Route = createFileRoute("/protected/projects/$projectId/edit")({
  component: EditProjectPage,
});

function EditProjectPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({
    name: "",
    description: "",
    github_url: "",
  });
  const [members, setMembers] = useState({});
  const [newMemberUID, setNewMemberUID] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectData = await fbFunctions.getProjectById(projectId);
        setProject(projectData);
        setMembers(projectData.members || {});
      } catch (error) {
        console.error("Failed to load project details", error);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleAddMember = async () => {
    if (!newMemberUID.trim()) return;
    setLoading(true);
    try {
      const user = await fbFunctions.getUserById(newMemberUID);
      if (!user) {
        alert("User not found");
        return;
      }

      setMembers((prev) => ({
        ...prev,
        [newMemberUID]: { isManager: false },
      }));
      setNewMemberUID("");
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (uid) => {
    setMembers((prev) => {
      const updated = { ...prev };
      delete updated[uid];
      return updated;
    });
  };

  const handleToggleManager = (uid) => {
    setMembers((prev) => ({
      ...prev,
      [uid]: { isManager: !prev[uid].isManager },
    }));
  };

  const handleSave = async () => {
    try {
      await fbFunctions.editProjectWithMembers(projectId, {
        ...project,
        members
      });
      navigate({ to: `/protected/projects/${projectId}` });
    } catch (error) {
      console.error("Failed to update project", error);
    }
  };

  if (!project) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Edit Project</h1>
      <TextField.Root value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} />
      <Text>Name</Text>

      <TextField.Root value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} />
      <Text>Description</Text>

      <TextField.Root value={project.github_url} onChange={(e) => setProject({ ...project, github_url: e.target.value })} />
      <Text>GitHub URL</Text>

      <h2 className="text-xl font-bold mt-6">Members</h2>
      <ul className="mt-2">
        {Object.keys(members).length > 0 ? (
          Object.entries(members).map(([uid, member]) => (
            <li key={uid} className="border p-2 rounded mb-2 flex justify-between items-center">
              <div>
                <p>
                  <strong>UID:</strong> {uid}
                </p>
                <p>
                  <strong>Role: {member.isManager ? "Manager" : "Member"}</strong>
                  <Switch checked={member.isManager} onCheckedChange={() => handleToggleManager(uid)} />
                </p>
              </div>
              <Button color="red" onClick={() => handleRemoveMember(uid)}>
                Remove
              </Button>
            </li>
          ))
        ) : (
          <p>No members found.</p>
        )}
      </ul>

      <div className="flex gap-2 mt-4">
        <TextField.Root value={newMemberUID} onChange={(e) => setNewMemberUID(e.target.value)} />
        <Text>New Member UID</Text>

        <Button onClick={handleAddMember} disabled={loading}>
          Add
        </Button>
      </div>

      <Button color="green" className="mt-4" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
}
