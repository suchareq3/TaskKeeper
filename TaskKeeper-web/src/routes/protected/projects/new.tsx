import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";
import { Button, TextField } from "@radix-ui/themes";
import { router } from "../../../main";

export const Route = createFileRoute("/protected/projects/new")({
  component: NewProjectPage,
});

function NewProjectPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    github_url: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await fbFunctions.createProject(formData.name, formData.description, formData.github_url);
    router.history.push("/protected/projects");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>
      <TextField.Root placeholder="Name" name="name" onChange={handleChange} />
      <TextField.Root placeholder="Description" name="description" onChange={handleChange} />
      <TextField.Root placeholder="GitHub URL" name="github_url" onChange={handleChange} />
      <Button onClick={handleSubmit}>Create</Button>
    </div>
  );
}
