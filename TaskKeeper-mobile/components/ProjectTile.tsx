import { View } from "react-native";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Text } from "./ui/text";

export default function ProjectTile({ title, description, githubUrl }: { title: string; description: string; githubUrl: string }) {
  return (
    <Card className="p-0">
      <CardHeader className="p-5">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-lg">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-start">
        <Text>{githubUrl}</Text>
        <Text>TODO: user profile thumbnails here</Text>
      </CardFooter>
    </Card>
  );
}
