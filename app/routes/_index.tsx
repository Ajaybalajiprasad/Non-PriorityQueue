import type { MetaFunction } from "@remix-run/node";
import Preview from "./preview";

export const meta: MetaFunction = () => {
  return [
    { title: "Resume to Portfolio Builder" },
    { name: "description", content: "Create a professional resume and portfolio in minutes!" },
  ];
};

export default function Index() {
  return (
    <Preview />
  );
}