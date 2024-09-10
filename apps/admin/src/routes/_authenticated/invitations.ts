import { createFileRoute } from "@tanstack/react-router";
import { Invitations } from "../../pages/Invitations";

export const Route = createFileRoute("/_authenticated/invitations")({
  component: Invitations,
});
