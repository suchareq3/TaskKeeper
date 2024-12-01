import { View } from "lucide-react-native";
import { Text } from "./ui/text";
import { H1, P } from "./ui/typography";
import { MoonStar } from "@/lib/icons/MoonStar";

//todo: RE-DO THIS ENTIRELY SO THAT IT LOOKS NICE! ideally an svg or png
export default function Logo({ className }: { className?: string }) {
  return (
    <>
      <P className={"text-5xl font-bold " + className}>TaskKeeper</P>
    </>
  );
}
