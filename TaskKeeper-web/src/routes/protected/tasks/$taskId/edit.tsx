import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { TextField, Button, Select, Text } from "@radix-ui/themes";

export const Route = createFileRoute("/protected/tasks/$taskId/edit")({
  component: EditTaskPage,
});

function EditTaskPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState({
    task_name: "",
    task_description: "",
    task_status: "",
    task_type: "",
    project_id: "",
    release_id: "",
    task_assignee_uid: "",
    priority_level: "3",
    subtasks: [],
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [releases, setReleases] = useState([]);
  const [projectMembers, setProjectMembers] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const taskData = await fbFunctions.getTaskById(taskId);
        setTask(taskData);

        const [projectList, userList] = await Promise.all([fbFunctions.getAllProjects(), fbFunctions.getAllUsers()]);

        // Fetch project-specific data
        const [releases, projectData] = await Promise.all([fbFunctions.getProjectReleases(taskData.project_id), fbFunctions.getProjectById(taskData.project_id)]);

        setProjects(projectList);
        setUsers(userList);
        setReleases(releases);
        setProjectMembers(new Set(Object.keys(projectData.members || {})));
      } catch (error) {
        console.error("Failed to load task data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId]);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!task.project_id) return;

      try {
        const [releases, projectData] = await Promise.all([fbFunctions.getProjectReleases(task.project_id), fbFunctions.getProjectById(task.project_id)]);

        setReleases(releases);
        setProjectMembers(new Set(Object.keys(projectData.members || {})));
      } catch (error) {
        console.error("Failed to fetch project data", error);
      }
    };

    fetchProjectData();
  }, [task.project_id]);

  const handleSave = async () => {
    if (!task.project_id || !task.release_id || !task.task_name) {
      alert("Please fill in required fields: Project, Release, and Task Name");
      return;
    }

    try {
      await fbFunctions.editTask(taskId, task.task_name, task.task_description, task.task_status,task.task_type, task.priority_level, task.task_assignee_uid, task.subtasks);
      navigate({ to: `/protected/tasks/${taskId}` });
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const filteredUsers = users.filter((user) => projectMembers.has(user.uid));

  if (loading) return <p>Loading task data...</p>;
  if (!task) return <p>Task not found</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Edit Task</h1>

      <div className="space-y-2">
        <Text as="div" size="2" weight="bold">
          Project
        </Text>
        <Select.Root
          value={task.project_id}
          onValueChange={(value) =>
            setTask({
              ...task,
              project_id: value,
              release_id: "",
              task_assignee_uid: "",
            })
          }
        >
          <Select.Trigger placeholder="Select project" />
          <Select.Content>
            {projects.map((project) => (
              <Select.Item key={project.id} value={project.id}>
                {project.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      <div className="space-y-2">
        <Text as="div" size="2" weight="bold">
          Release
        </Text>
        <Select.Root value={task.release_id} onValueChange={(value) => setTask({ ...task, release_id: value })}>
          <Select.Trigger placeholder="Select release" />
          <Select.Content>
            {releases.map((release) => (
              <Select.Item key={release.releaseId} value={release.releaseId}>
                {release.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      <div className="space-y-2">
        <Text as="div" size="2" weight="bold">
          Task Name
        </Text>
        <TextField.Root value={task.task_name} onChange={(e) => setTask({ ...task, task_name: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Text as="div" size="2" weight="bold">
          Description
        </Text>
        <TextField.Root value={task.task_description} onChange={(e) => setTask({ ...task, task_description: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Text as="div" size="2" weight="bold">
            Status
          </Text>
          <Select.Root value={task.task_status} onValueChange={(value) => setTask({ ...task, task_status: value })}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="in-progress">In Progress</Select.Item>
              <Select.Item value="completed">Completed</Select.Item>
              <Select.Item value="blocked">Blocked</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div className="space-y-2">
          <Text as="div" size="2" weight="bold">
            Type
          </Text>
          <Select.Root value={task.task_type} onValueChange={(value) => setTask({ ...task, task_type: value })}>
            <Select.Trigger />
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
        </div>

        <div className="space-y-2">
          <Text as="div" size="2" weight="bold">
            Assigned To
          </Text>
          <Select.Root value={task.task_assignee_uid} onValueChange={(value) => setTask({ ...task, task_assignee_uid: value })}>
            <Select.Trigger placeholder="Unassigned" />
            <Select.Content>
              {filteredUsers.map((user) => (
                <Select.Item key={user.id} value={user.id}>
                  {user.first_name + " " + user.last_name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div className="space-y-2">
          <Text as="div" size="2" weight="bold">
            Priority
          </Text>
          <Select.Root value={task.priority_level} onValueChange={(value) => setTask({ ...task, priority_level: value })}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="1">Highest (1)</Select.Item>
              <Select.Item value="2">High (2)</Select.Item>
              <Select.Item value="3">Medium (3)</Select.Item>
              <Select.Item value="4">Low (4)</Select.Item>
              <Select.Item value="5">Lowest (5)</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  );
}
