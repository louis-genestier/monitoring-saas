import { createFileRoute } from "@tanstack/react-router";
import { VerifyEmail } from "../pages/VerifyEmail";
import { client } from "@repo/front-logic";

export const Route = createFileRoute("/verifier-email/$verificationToken")({
  component: VerifyEmail,
  loader: async ({ params }) => {
    const res = await client.auth["verify-email"][":token"].$get({
      param: {
        token: params.verificationToken,
      },
    });

    if (res.status === 200) {
      return {
        success: true,
      };
    }

    return {
      success: false,
    };
  },
});
