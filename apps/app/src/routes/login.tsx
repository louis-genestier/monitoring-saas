import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../pages/Login";
import { useAuthStore } from "../store/authStore";
import { z } from "zod";

const searchSchema = z
  .object({
    invitationCode: z.string().optional(),
  })
  .or(
    z.object({
      invitationCode: z.number().optional(),
    })
  );

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    if (useAuthStore.getState().user) {
      throw redirect({
        to: "/",
      });
    }
  },
});
