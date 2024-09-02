import { Button } from "@repo/ui";
import { client } from "../api/utils";
import { useNavigate } from "@tanstack/react-router";
import { Route } from "../routes/_authenticated";

export const Dashboard = () => {
  const user = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.email}!</p>
      <Button
        onClick={async () => {
          await client.auth.logout.$post();
          navigate({
            to: "/login",
          });
        }}
      >
        Logout
      </Button>
    </div>
  );
};
