import { createFileRoute } from "@tanstack/react-router";
import { Websites } from "../../pages/Websites";

export const Route = createFileRoute("/_authenticated/websites")({
  component: Websites,
});
