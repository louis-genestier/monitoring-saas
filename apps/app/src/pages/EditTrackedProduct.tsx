import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useUpdateTrackedProduct } from "../queries/trackedProducts.queries";

import { Route } from "../routes/_authenticated/suivi/$trackedProductId/modifier";
import { ReturnToDashboard } from "../components/ReturnToDashboard";
import { useAlertProviders } from "../queries/alertProviders.queries";
import { useNavigate } from "@tanstack/react-router";

const PriceType = {
  NEW: "NEW",
  USED: "USED",
};

const schema = z.object({
  threshold: z
    .number({
      message: "Le seuil de prix doit être un nombre",
    })
    .min(0, "Le seuil de prix doit être positif"),
  alertProviderId: z.string().min(1, "Le type d'alerte est requis"),
  isEnabled: z.boolean(),
  priceType: z.nativeEnum(PriceType),
});

type FormValues = z.infer<typeof schema>;

export const EditTrackedProduct = () => {
  const trackedProduct = Route.useLoaderData();
  const {
    mutate: updateTrackedProduct,
    isPending: isUpdateTrackedProductPending,
  } = useUpdateTrackedProduct();
  const { data, isLoading: isAlertProvidersLoading } = useAlertProviders();
  const navigate = useNavigate();

  const alertProviders = data?.items ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      threshold: trackedProduct.threshold,
      alertProviderId: trackedProduct.alertProviderId,
      isEnabled: trackedProduct.isEnabled,
      priceType: trackedProduct.priceType,
    },
  });

  //   React.useEffect(() => {
  //     if (trackedProduct) {
  //       form.reset({
  //         threshold: trackedProduct.threshold,
  //         alertProviderId: trackedProduct.alertProviderId,
  //         isEnabled: trackedProduct.isEnabled,
  //         priceType: trackedProduct.priceType,
  //       });
  //     }
  //   }, [trackedProduct, form]);

  const onSubmit = (data: FormValues) => {
    updateTrackedProduct(
      {
        id: trackedProduct.id,
        productId: trackedProduct.productId,
        ...data,
        priceType: data.priceType as keyof typeof PriceType,
      },
      {
        onSuccess: () => {
          navigate({ to: "/" });
        },
      }
    );
  };

  console.log(trackedProduct);

  return (
    <div className="container mx-auto p-4">
      <ReturnToDashboard />
      <Card>
        <CardHeader>
          <CardTitle>
            Modifier suivi de produit: {trackedProduct.product.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAlertProvidersLoading || isUpdateTrackedProductPending ? (
            <div className="flex flex-col gap-2 justify-center items-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seuil de prix</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Définir le seuil de prix pour les alertes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alertProviderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'alerte</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!!isAlertProvidersLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un type d'alerte" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {alertProviders.map((alertProvider) => (
                            <SelectItem
                              value={alertProvider.id}
                              key={alertProvider.id}
                            >
                              {alertProvider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choisir comment vous souhaitez recevoir les alertes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neuf ou d'occasion</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir le type de produit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PriceType.NEW}>Neuf</SelectItem>
                          <SelectItem value={PriceType.USED}>
                            D'occasion
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choisir le type de produit
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
                        <FormLabel className="text-base">Activation</FormLabel>
                        <FormDescription>
                          Recevoir des alertes pour ce produit suivi
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-accent text-white hover:bg-accent/80"
                  disabled={isUpdateTrackedProductPending}
                >
                  {isUpdateTrackedProductPending ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    "Modifier le suivi de produit"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
