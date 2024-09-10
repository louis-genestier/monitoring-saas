import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Route } from "../routes/_authenticated";
import { useNavigate } from "@tanstack/react-router";
import { client } from "@repo/front-logic";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  UsersIcon,
  DollarSignIcon,
  PackageIcon,
  GlobeIcon,
} from "lucide-react";

export const Dashboard = () => {
  const user = Route.useLoaderData();
  const navigate = useNavigate();

  const { data: userMetrics } = useQuery({
    queryKey: ["userMetrics"],
    queryFn: () => client.admin.metrics.users.$get().then((res) => res.json()),
  });

  const { data: revenueMetrics } = useQuery({
    queryKey: ["revenueMetrics"],
    queryFn: () =>
      client.admin.metrics.revenue.$get().then((res) => res.json()),
  });

  const handleLogout = async () => {
    await client.auth.logout.$post();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-blue-500 text-white p-4">
              <CardTitle className="text-lg font-medium flex items-center">
                <UsersIcon className="w-5 h-5 mr-2" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-gray-800">
                {userMetrics?.totalUsers || "..."}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-green-500 text-white p-4">
              <CardTitle className="text-lg font-medium flex items-center">
                <DollarSignIcon className="w-5 h-5 mr-2" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-gray-800">
                ${revenueMetrics?.monthlyRecurringRevenue?.toFixed(2) || "..."}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-purple-500 text-white p-4">
              <CardTitle className="text-lg font-medium flex items-center">
                <PackageIcon className="w-5 h-5 mr-2" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-gray-800">1,234</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-indigo-500 text-white p-4">
              <CardTitle className="text-lg font-medium flex items-center">
                <PackageIcon className="w-5 h-5 mr-2" />
                Manage Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-600 mb-4">
                View, add, edit, or delete products in your catalog.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Products
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-pink-500 text-white p-4">
              <CardTitle className="text-lg font-medium flex items-center">
                <GlobeIcon className="w-5 h-5 mr-2" />
                Manage Websites
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-600 mb-4">
                Manage the websites you're monitoring for price changes.
              </p>
              <Link
                to="/websites"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Go to Websites
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-green-500 text-white p-4">
              <CardTitle className="text-lg font-medium flex items-center">
                <GlobeIcon className="w-5 h-5 mr-2" />
                Manage invitations codes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-600 mb-4">Manage the invitations codes</p>
              <Link
                to="/invitations"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Go to invitation codes
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
