import { createFileRoute } from "@tanstack/react-router";
import { Parameters } from "../../pages/Parameters";
import { z } from "zod";

const searchSchema = z.object({
  session_id: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/parametres")({
  component: Parameters,
  validateSearch: searchSchema,
});
