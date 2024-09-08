import React, { useState, useEffect } from "react";
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
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  PackageIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  externalIds: z.array(
    z.object({
      websiteId: z.string(),
      value: z.string(),
    })
  ),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  ProductId: Array<{
    id: string;
    websiteId: string;
    externalId: string;
    website: {
      name: string;
    };
  }>;
}

interface Website {
  id: string;
  name: string;
}

export const Products: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormValues>({
    name: "",
    externalIds: [],
  });

  const { data: products, isLoading: productsLoading } = useQuery<{
    items: Product[];
  }>({
    queryKey: ["products"],
    queryFn: () => client.admin.products.$get().then((res) => res.json()),
  });

  const { data: websites, isLoading: websitesLoading } = useQuery<{
    items: Website[];
  }>({
    queryKey: ["websites"],
    queryFn: () => client.admin.websites.$get().then((res) => res.json()),
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: formData,
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "externalIds",
  });

  useEffect(() => {
    if (websites?.items) {
      const initialExternalIds = websites.items.map((website) => ({
        websiteId: website.id,
        value: "",
      }));
      setFormData((prevData) => ({
        ...prevData,
        externalIds: initialExternalIds,
      }));
      replace(initialExternalIds);
    }
  }, [websites, replace]);

  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormValues) =>
      client.admin.products.$post({ json: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      handleDialogClose();
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (data: ProductFormValues & { id: string }) =>
      client.admin.products[":id"].$put({ param: { id: data.id }, json: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      handleDialogClose();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) =>
      client.admin.products[":id"].$delete({ param: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    if (editingProduct) {
      const formattedData = {
        ...data,
        id: editingProduct.id,
        externalIds: data.externalIds.filter((id) => id.value !== ""),
      };
      updateProductMutation.mutate(formattedData);
    } else {
      const formattedData = {
        ...data,
        externalIds: data.externalIds.filter((id) => id.value !== ""),
      };
      createProductMutation.mutate(formattedData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const updatedExternalIds =
      websites?.items.map((website) => {
        const existingId = product.ProductId.find(
          (id) => id.websiteId === website.id
        );
        return {
          websiteId: website.id,
          value: existingId ? existingId.externalId : "",
        };
      }) || [];
    setFormData({
      name: product.name,
      externalIds: updatedExternalIds,
    });
    replace(updatedExternalIds);
    form.reset({
      name: product.name,
      externalIds: updatedExternalIds,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    const initialExternalIds =
      websites?.items.map((website) => ({
        websiteId: website.id,
        value: "",
      })) || [];
    setFormData({
      name: "",
      externalIds: initialExternalIds,
    });
    replace(initialExternalIds);
    form.reset({
      name: "",
      externalIds: initialExternalIds,
    });
  };

  if (productsLoading || websitesLoading) return <div>Loading...</div>;

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
              onClick={() => setIsDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>External IDs</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      {product.ProductId.map((id) => (
                        <div key={id.id} className="text-sm text-gray-500">
                          {id.website.name}: {id.externalId}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleEdit(product)}
                        variant="outline"
                        size="sm"
                        className="mr-2"
                      >
                        <EditIcon className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(product.id)}
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
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Edit the product details below."
                : "Enter the details for the new product."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`externalIds.${index}.value`}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <FormLabel>
                        {
                          websites?.items.find((w) => w.id === field.websiteId)
                            ?.name
                        }{" "}
                        External ID
                      </FormLabel>
                      <FormControl>
                        <Input {...inputField} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
