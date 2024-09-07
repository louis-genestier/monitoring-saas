import { createFileRoute } from "@tanstack/react-router";
import { AddTrackedProduct } from "../../../pages/AddTrackedProduct";

export const Route = createFileRoute("/_authenticated/suivi/ajouter")({
  component: AddTrackedProduct,
});
