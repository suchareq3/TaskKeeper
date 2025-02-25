import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";
import { TextField, Button, Select } from "@radix-ui/themes";
import { router } from "../../../main";

export const Route = createFileRoute("/protected/releases/new")({
  component: NewReleasePage,
});

function NewReleasePage() {
  const navigate = useNavigate();
  const [release, setRelease] = useState({
    name: "",
    description: "",
    project_id: "",
    planned_end_date: new Date(),
  });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectList = await fbFunctions.getAllProjects();
        setProjects(projectList);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };

    fetchProjects();
  }, []);

  const handleSave = async () => {
    if (!release.project_id) {
      alert("Please select a project for this release.");
      return;
    }
    await fbFunctions.createRelease(release.project_id, release.name, release.description, release.planned_end_date);
    router.history.push("/protected/releases");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">New</h1>
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
      
      <TextField.Root type="text" placeholder="Release Name" onChange={(e) => setRelease({ ...release, name: e.target.value })} />
      <TextField.Root type="text" placeholder="Description" onChange={(e) => setRelease({ ...release, description: e.target.value })} />
      <TextField.Root type="date" placeholder="Planned End Date" onChange={(e) => setRelease({ ...release, planned_end_date: new Date(e.target.value) })} />
      <Button onClick={handleSave}>Create</Button>
    </div>
  );
}
