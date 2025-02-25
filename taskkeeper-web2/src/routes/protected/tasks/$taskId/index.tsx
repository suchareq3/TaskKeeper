import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { DataList, Button, Badge } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";

export const Route = createFileRoute("/protected/tasks/$taskId/")({
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const [task, setTask] = useState(null);
  const [assignee, setAssignee] = useState(null);
  const [project, setProject] = useState(null);
  const [release, setRelease] = useState(null);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const taskData = await fbFunctions.getTaskById(taskId);
        setTask(taskData);

        // Fetch related data
        const [userData, projectData, releaseData] = await Promise.all([
          taskData.assigned_user_uid ? fbFunctions.getUserById(taskData.assigned_user_uid) : Promise.resolve(null),
          fbFunctions.getProjectById(taskData.project_id),
          taskData.release_id ? fbFunctions.getReleaseById(taskData.release_id) : Promise.resolve(null),
        ]);

        setAssignee(userData);
        setProject(projectData);
        setRelease(releaseData);
      } catch (error) {
        console.error("Failed to load task details", error);
      }
    };

    fetchTaskData();
  }, [taskId]);

  if (!task) return <p>Loading task details...</p>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold">{task.task_name}</h1>
        <Button asChild>
          <Link to="/protected/tasks">Back to Tasks</Link>
        </Button>
      </div>

      <DataList.Root className="space-y-4">
        {/* Basic Info */}
        <DataList.Item>
          <DataList.Label>Task ID</DataList.Label>
          <DataList.Value>{taskId}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Description</DataList.Label>
          <DataList.Value>{task.task_description || "No description"}</DataList.Value>
        </DataList.Item>

        {/* Status & Type */}
        <DataList.Item>
          <DataList.Label>Status</DataList.Label>
          <DataList.Value>
            <Badge color={getStatusColor(task.task_status)}>{task.task_status}</Badge>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Type</DataList.Label>
          <DataList.Value>
            <Badge variant="outline">{formatTaskType(task.task_type)}</Badge>
          </DataList.Value>
        </DataList.Item>

        {/* Dates */}
        <DataList.Item>
          <DataList.Label>Created</DataList.Label>
          <DataList.Value>{formatFirestoreTimestamp(task.created_on)}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Last Updated</DataList.Label>
          <DataList.Value>{formatFirestoreTimestamp(task.last_updated_on)}</DataList.Value>
        </DataList.Item>

        {/* Relationships */}
        <DataList.Item>
          <DataList.Label>Project</DataList.Label>
          <DataList.Value>
            {project ? (
              <Link to={`/protected/projects/${task.project_id}`} className="text-blue-600">
                {project.name}
              </Link>
            ) : (
              task.project_id
            )}
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Release</DataList.Label>
          <DataList.Value>
            {release ? (
              <Link to={`/protected/releases/${task.release_id}`} className="text-blue-600">
                {release.name}
              </Link>
            ) : (
              task.release_id || "No release"
            )}
          </DataList.Value>
        </DataList.Item>

        {/* Assignment */}
        <DataList.Item>
          <DataList.Label>Assigned To</DataList.Label>
          <DataList.Value>
            {assignee ? (
              <div className="flex items-center gap-2">
                <span>{`${assignee.first_name} ${assignee.last_name}`}</span>
              </div>
            ) : (
              "Unassigned"
            )}
          </DataList.Value>
        </DataList.Item>

        {/* Priority */}
        <DataList.Item>
          <DataList.Label>Priority</DataList.Label>
          <DataList.Value>
            <div className="flex items-center gap-2">
              <span>Level {task.priority_level}</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-2 w-2 rounded-full ${i < task.priority_level ? "bg-red-500" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>
          </DataList.Value>
        </DataList.Item>

        {/* Subtasks */}
        <DataList.Item>
          <DataList.Label>Subtasks</DataList.Label>
          <DataList.Value>
            <div className="space-y-2">
              {task.subtasks?.length > 0 ? (
                task.subtasks.map((subtask, index) => (
                  <div key={subtask.key} className="flex items-center gap-2">
                    <input type="checkbox" checked={subtask.completed} readOnly className="h-4 w-4" />
                    <span className={subtask.completed ? "line-through text-gray-500" : ""}>{subtask.label}</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-500">No subtasks</span>
              )}
            </div>
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </div>
  );
}

// Helper functions
function formatFirestoreTimestamp(timestamp) {
  if (!timestamp) return "N/A";
  const date = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  return date.toLocaleString();
}

function formatTaskType(type) {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "completed":
      return "green";
    case "in progress":
      return "blue";
    case "blocked":
      return "red";
    default:
      return "gray";
  }
}
