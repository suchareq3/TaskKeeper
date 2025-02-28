import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fbFunctions } from "../../../../../../shared/firebaseFunctions";
import { DataList } from "@radix-ui/themes";
import { Timestamp } from "firebase/firestore";

export const Route = createFileRoute("/protected/releases/$releaseId/")({
  component: ReleaseDetailPage,
});

function ReleaseDetailPage() {
  const { releaseId } = Route.useParams();
  const [release, setRelease] = useState(null);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const releaseData = await fbFunctions.getReleaseById(releaseId);
        setRelease(releaseData);

        // Fetch project name for display
        if (releaseData.project_id) {
          const project = await fbFunctions.getProjectById(releaseData.project_id);
          setProjectName(project?.name || "Unknown Project");
        }
      } catch (error) {
        console.error("Failed to load release details", error);
      }
    };

    fetchRelease();
  }, [releaseId]);

  if (!release) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{release.name}</h1>
      <p>{release.description}</p>

      <DataList.Root>
        <DataList.Item>
          <DataList.Label>Release ID</DataList.Label>
          <DataList.Value>{releaseId}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Project</DataList.Label>
          <DataList.Value>{projectName}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Status</DataList.Label>
          <DataList.Value>{release.status}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Created On</DataList.Label>
          <DataList.Value>{new Timestamp(release.created_on.seconds, release.created_on.nanoseconds).toDate().toUTCString()}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Last Updated On</DataList.Label>
          <DataList.Value>{new Timestamp(release.last_updated_on.seconds, release.last_updated_on.nanoseconds).toDate().toUTCString()}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Start Date</DataList.Label>
          <DataList.Value>{release.start_date ? new Timestamp(release.start_date.seconds, release.start_date.nanoseconds).toDate().toUTCString() : "N/A"}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Planned End Date</DataList.Label>
          <DataList.Value>{release.planned_end_date ? new Timestamp(release.planned_end_date.seconds, release.planned_end_date.nanoseconds).toDate().toUTCString() : "N/A"}</DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Actual End Date</DataList.Label>
          <DataList.Value>{release.actual_end_date ? new Timestamp(release.actual_end_date.seconds, release.actual_end_date.nanoseconds).toDate().toUTCString() : "N/A"}</DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </div>
  );
}
