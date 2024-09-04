/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@repo/front-logic";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Form,
  FormField,
  FormDescription,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Checkbox,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  GlobeIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

const websiteSchema = z.object({
  name: z.string().min(1, "Website name is required"),
  apiBaseurl: z.string().url("Must be a valid URL"),
  headers: z.string(),
  parameters: z.string().optional(),
  isEnabled: z.boolean(),
});

type WebsiteFormValues = z.infer<typeof websiteSchema>;

export const Websites: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<any | null>(null);

  const { data: websites, isLoading } = useQuery({
    queryKey: ["websites"],
    queryFn: () => client.admin.websites.$get().then((res) => res.json()),
  });

  const form = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      name: "",
      apiBaseurl: "",
      headers: "{}",
      parameters: "",
      isEnabled: true,
    },
  });

  const createWebsiteMutation = useMutation({
    mutationFn: (data: WebsiteFormValues) =>
      client.admin.websites.$post({ json: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateWebsiteMutation = useMutation({
    mutationFn: (data: WebsiteFormValues & { id: string }) =>
      client.admin.websites[":id"].$put({ param: { id: data.id }, json: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] });
      setIsDialogOpen(false);
      setEditingWebsite(null);
      form.reset();
    },
  });

  const deleteWebsiteMutation = useMutation({
    mutationFn: (id: string) =>
      client.admin.websites[":id"].$delete({ param: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] });
    },
  });

  const testWebsiteMutation = useMutation({
    mutationFn: (id: string) =>
      client.admin.websites[":id"].test.$get({ param: { id } }),
    onSuccess: (data) => {
      alert(`Website test ${data.ok ? "succeeded" : "failed"}`);
    },
    onError: (error) => {
      alert(`Test failed: ${error.message}`);
    },
  });

  const onSubmit = (data: WebsiteFormValues) => {
    let formattedData;
    try {
      const parsedHeaders = JSON.parse(data.headers);
      formattedData = {
        ...data,
        headers: JSON.stringify(parsedHeaders),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      try {
        const objFunc = new Function("return " + data.headers);
        const parsedHeaders = objFunc();

        if (typeof parsedHeaders === "object" && parsedHeaders !== null) {
          formattedData = {
            ...data,
            headers: JSON.stringify(parsedHeaders),
          };
        } else {
          throw new Error("Headers must be a valid object");
        }
      } catch (evalError) {
        console.error("Invalid headers format:", evalError);
        form.setError("headers", {
          type: "manual",
          message:
            "Invalid headers format. Please provide a valid JSON object or JavaScript object literal.",
        });
        return;
      }
    }

    if (editingWebsite) {
      updateWebsiteMutation.mutate({ ...formattedData, id: editingWebsite.id });
    } else {
      createWebsiteMutation.mutate(formattedData);
    }
  };

  const handleEdit = (website: any) => {
    setEditingWebsite(website);
    form.reset({
      name: website.name,
      apiBaseurl: website.apiBaseurl,
      headers: website.headers,
      parameters: website.parameters || "",
      isEnabled: website.isEnabled,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this website?")) {
      deleteWebsiteMutation.mutate(id);
    }
  };

  const toggleWebsiteStatus = (website: any) => {
    updateWebsiteMutation.mutate({
      ...website,
      isEnabled: !website.isEnabled,
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingWebsite(null);
    form.reset({
      name: "",
      apiBaseurl: "",
      headers: "{}",
      parameters: "",
      isEnabled: true,
    });
  };

  const handleTest = (id: string) => {
    testWebsiteMutation.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center text-pink-600 hover:text-pink-800"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      <Card className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
        <CardHeader className="bg-pink-500 text-white p-4">
          <CardTitle className="text-lg font-medium flex items-center">
            <GlobeIcon className="w-5 h-5 mr-2" />
            Websites
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              Manage the websites you're monitoring
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Website
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Base URL</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {websites?.items.map((website: any) => (
                  <TableRow key={website.id}>
                    <TableCell className="font-medium">
                      {website.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {website.apiBaseurl}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={website.isEnabled}
                        onCheckedChange={() => toggleWebsiteStatus(website)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleEdit(website)}
                        variant="outline"
                        size="sm"
                        className="mr-2"
                      >
                        <EditIcon className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleTest(website.id)}
                        variant="outline"
                        size="sm"
                        className="mr-2"
                      >
                        <GlobeIcon className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        onClick={() => handleDelete(website.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingWebsite ? "Edit Website" : "Add New Website"}
            </DialogTitle>
            <DialogDescription>
              {editingWebsite
                ? "Edit the website details below."
                : "Enter the details for the new website."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apiBaseurl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Base URL</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="headers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headers (JSON)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parameters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parameters</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormDescription>
                      Optional field for additional parameters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enabled</FormLabel>
                      <FormDescription>
                        Enable or disable this website for monitoring
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                {editingWebsite ? "Update Website" : "Create Website"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
