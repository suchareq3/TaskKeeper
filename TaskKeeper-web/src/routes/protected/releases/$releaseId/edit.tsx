import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { TextField, Button, Select, Text } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";

export const Route = createFileRoute("/protected/releases/$releaseId/edit")({
  component: EditReleasePage,
});

function EditReleasePage() {
  const { releaseId } = Route.useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState({
    name: "",
    description: "",
    project_id: "",
    planned_end_date: Timestamp.now(),
    status: "",
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReleaseAndProjects = async () => {
      try {
        const releaseData = await fbFunctions.getReleaseById(releaseId);
        const projectList = await fbFunctions.getAllProjects();
        setRelease(releaseData);
        setProjects(projectList);
      } catch (error) {
        console.error("Failed to load release data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReleaseAndProjects();
  }, [releaseId]);

  const handleSave = async () => {
    if (!release.project_id) {
      alert("Please select a project for this release.");
      return;
    }

    await fbFunctions.editRelease(releaseId, release.name, release.description, release.planned_end_date.toDate(), release.status);

    navigate({ to: `/protected/releases/${releaseId}` });
  };

  if (loading) return <p>Loading...</p>;
  if (!release) return <p>Release not found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Edit Release</h1>

      <Text>Project</Text>
      <br />
      <Select.Root value={release.project_id} onValueChange={(value) => setRelease({ ...release, project_id: value })}>
        <Select.Trigger placeholder="Select a project" />
        <Select.Content>
          {projects.map((project) => (
            <Select.Item key={project.id} value={project.id}>
              {project.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <br />

      <Text>Name</Text>
      <TextField.Root value={release.name} onChange={(e) => setRelease({ ...release, name: e.target.value })} />

      <Text>Description</Text>
      <TextField.Root value={release.description} onChange={(e) => setRelease({ ...release, description: e.target.value })} />

      <Text>Planned End Date</Text>
      <TextField.Root
        type="date"
        value={new Timestamp(release.planned_end_date.seconds, release.planned_end_date.nanoseconds).toDate().toISOString().split("T")[0]}
        onChange={(e) => setRelease({ ...release, planned_end_date: Timestamp.fromDate(new Date(e.target.value)) })}
      />

      <Button className="mt-4" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
}
