import { client } from "@repo/front-logic";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, PackageIcon, PlusIcon, TrashIcon } from "lucide-react";

export const Invitations = () => {
  const queryClient = useQueryClient();

  const { data: codes } = useQuery({
    queryKey: ["codes"],
    queryFn: () => client.admin.invitations.$get().then((res) => res.json()),
  });

  const generateInvitationCode = useMutation({
    mutationFn: () =>
      client.admin.invitations.$post().then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codes"] });
    },
  });

  const deleteInvitationCode = useMutation({
    mutationFn: (id: string) =>
      client.admin.invitations[":id"].$delete({
        param: { id },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codes"] });
    },
  });

  console.log(codes);
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      <Card className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
        <CardHeader className="bg-indigo-500 text-white p-4">
          <CardTitle className="text-lg font-medium flex items-center">
            <PackageIcon className="w-5 h-5 mr-2" />
            Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Manage your product catalog</p>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => generateInvitationCode.mutate()}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Generate new code
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes?.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.code}</TableCell>
                    <TableCell>{code.isUsed ? "Used" : "Not Used"}</TableCell>
                    <TableCell>{code.user?.email}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => deleteInvitationCode.mutate(code.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
