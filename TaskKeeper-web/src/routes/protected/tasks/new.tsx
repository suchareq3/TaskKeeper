import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";
import { TextField, Button, Select } from "@radix-ui/themes";
import { router } from "../../../main";

export const Route = createFileRoute("/protected/tasks/new")({
  component: NewTaskPage,
});

function NewTaskPage() {
  const navigate = useNavigate();
  const [task, setTask] = useState({
    task_name: "",
    task_description: "",
    task_type: "new-feature",
    project_id: "",
    release_id: "",
    assigned_user_uid: "",
    priority_level: "3",
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [releases, setReleases] = useState([]);
  const [loadingReleases, setLoadingReleases] = useState(false);
  const [projectMembers, setProjectMembers] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectList, userList] = await Promise.all([fbFunctions.getAllProjects(), fbFunctions.getAllUsers()]);
        setProjects(projectList);
        setUsers(userList);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchReleasesAndMembers = async () => {
      if (!task.project_id) return;

      setLoadingReleases(true);
      try {
        const [releases, projectData] = await Promise.all([fbFunctions.getProjectReleases(task.project_id), fbFunctions.getProjectById(task.project_id)]);

        setReleases(releases);
        setProjectMembers(new Set(Object.keys(projectData.members || {})));
      } catch (error) {
        console.error("Failed to fetch data", error);
        setReleases([]);
        setProjectMembers(new Set());
      } finally {
        setLoadingReleases(false);
      }
    };

    fetchReleasesAndMembers();
  }, [task.project_id]);

  const handleSave = async () => {
    if (!task.project_id || !task.release_id || !task.task_name) {
      alert("Please select a project, release, and enter a task name.");
      return;
    }

    try {
      await fbFunctions.createTask(task.release_id, task.project_id, task.task_name, task.task_description, task.priority_level, task.task_type, task.assigned_user_uid, [])
      router.history.push("/protected/tasks");
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  // Filter users based on project membership
  const filteredUsers = users.filter((user) => projectMembers.has(user.id));

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">New Task</h1>

      <div className="space-y-4">
        <Select.Root
          value={task.project_id}
          onValueChange={(value) =>
            setTask({
              ...task,
              project_id: value,
              release_id: "",
              assigned_user_uid: "", // Reset assignment when project changes
            })
          }
        >
          <Select.Trigger placeholder="Select a project" />
          <Select.Content>
            {projects.map((project) => (
              <Select.Item key={project.id} value={project.id}>
                {project.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        {task.project_id && (
          <Select.Root value={task.release_id} onValueChange={(value) => setTask({ ...task, release_id: value })} disabled={!task.project_id || loadingReleases}>
            <Select.Trigger placeholder={loadingReleases ? "Loading releases..." : "Select a release"} />
            <Select.Content>
              {releases.length > 0 ? (
                releases.map((release) => (
                  <Select.Item key={release.releaseId} value={release.releaseId}>
                    {release.name}
                  </Select.Item>
                ))
              ) : (
                <Select.Item value="no-releases" disabled>
                  No releases found for this project
                </Select.Item>
              )}
            </Select.Content>
          </Select.Root>
        )}
      </div>

      <TextField.Root placeholder="Task Name *" onChange={(e) => setTask({ ...task, task_name: e.target.value })} />

      <TextField.Root placeholder="Description" onChange={(e) => setTask({ ...task, task_description: e.target.value })} />

      <div className="grid grid-cols-2 gap-4">
        <Select.Root value={task.task_type} onValueChange={(value) => setTask({ ...task, task_type: value })}>
          <Select.Trigger placeholder="Task Type" />
          <Select.Content>
            <Select.Item value="new-feature">New Feature</Select.Item>
            <Select.Item value="change">Change</Select.Item>
            <Select.Item value="bug-fix">Bug Fix</Select.Item>
            <Select.Item value="testing">Testing</Select.Item>
            <Select.Item value="documentation">Documentation</Select.Item>
            <Select.Item value="research">Research</Select.Item>
            <Select.Item value="other">Other</Select.Item>
          </Select.Content>
        </Select.Root>

        <Select.Root value={task.assigned_user_uid} onValueChange={(value) => setTask({ ...task, assigned_user_uid: value })} disabled={!task.project_id}>
          <Select.Trigger placeholder={task.project_id ? "Assign to" : "Select project first"} />
          <Select.Content>
            {filteredUsers.map((user) => (
              <Select.Item key={user.id} value={user.id}>
                {user.first_name + " " + user.last_name}
              </Select.Item>
            ))}
            {filteredUsers.length === 0 && (
              <Select.Item value="no-users" disabled>
                No members in this project
              </Select.Item>
            )}
          </Select.Content>
        </Select.Root>

        <Select.Root value={task.priority_level} onValueChange={(value) => setTask({ ...task, priority_level: value })}>
          <Select.Trigger placeholder="Priority" />
          <Select.Content>
            <Select.Item value="1">Highest (1)</Select.Item>
            <Select.Item value="2">High (2)</Select.Item>
            <Select.Item value="3">Medium (3)</Select.Item>
            <Select.Item value="4">Low (4)</Select.Item>
            <Select.Item value="5">Lowest (5)</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>

      <Button onClick={handleSave}>Create Task</Button>
    </div>
  );
}
