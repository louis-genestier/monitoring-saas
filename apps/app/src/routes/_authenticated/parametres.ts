import { createFileRoute } from "@tanstack/react-router";
import { Parameters } from "../../pages/Parameters";

export const Route = createFileRoute("/_authenticated/parametres")({
  component: Parameters,
});
