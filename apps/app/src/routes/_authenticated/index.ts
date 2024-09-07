import { createFileRoute } from "@tanstack/react-router";
import { TrackedProductsTable } from "../../pages/trackedProductsTable";

export const Route = createFileRoute("/_authenticated/")({
  component: TrackedProductsTable,
});
