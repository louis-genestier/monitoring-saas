import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Combobox,
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
import { useCreateTrackedProduct } from "../queries/trackedProducts.queries";
import { ReturnToDashboard } from "../components/ReturnToDashboard";
import { useAlertProviders } from "../queries/alertProviders.queries";
import { useNavigate } from "@tanstack/react-router";
import { useProducts } from "../queries/products.queries";
import { OnboardingTooltip } from "../components/OnboardingTooltip";

const PriceType = {
  NEW: "NEW",
  USED: "USED",
};

const schema = z.object({
  productId: z.string().min(1, "Vous devez sélectionner un produit"),
  threshold: z
    .number({
      required_error: "Le seuil de prix est requis",
      invalid_type_error: "Le seuil de prix doit être un nombre",
    })
    .min(0, "Le seuil de prix doit être positif"),
  alertProviderId: z.string().min(1, "Le type d'alerte est requis"),
  isEnabled: z.boolean(),
  priceType: z.nativeEnum(PriceType),
});

type FormValues = z.infer<typeof schema>;

export const AddTrackedProduct = () => {
  const {
    mutate: createTrackedProduct,
    isPending: isCreateTrackedProductPending,
  } = useCreateTrackedProduct();
  const { data, isLoading: isAlertProvidersLoading } = useAlertProviders();
  const navigate = useNavigate();

  const { data: products } = useProducts({
    page: 1,
    limit: 10,
  });

  const alertProviders = data?.items ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: "",
      threshold: 0,
      alertProviderId: "",
      isEnabled: true,
      priceType: PriceType.NEW,
    },
  });

  const onSubmit = (data: FormValues) => {
    createTrackedProduct(
      {
        productId: data.productId,
        threshold: data.threshold,
        alertProviderId: data.alertProviderId,
        isEnabled: data.isEnabled,
        priceType: data.priceType as keyof typeof PriceType,
      },
      {
        onSuccess: () => {
          navigate({ to: "/" });
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-4 xl:w-4/5">
      <ReturnToDashboard />
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un nouveau produit suivi</CardTitle>
        </CardHeader>
        <CardContent>
          {isAlertProvidersLoading ? (
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
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <span>Produit</span>
                        <OnboardingTooltip content="Sélectionnez le produit que vous souhaitez suivre. Vous pouvez rechercher par nom ou référence." />
                      </FormLabel>
                      <Combobox
                        options={
                          products?.items.map((product) => ({
                            value: product.id,
                            label: product.name,
                          })) ?? []
                        }
                        value={
                          products?.items.find(
                            (product) => product.id === field.value
                          )?.name ?? "Choisir un produit"
                        }
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <span>Seuil de prix</span>
                        <OnboardingTooltip content="Définissez le prix en dessous duquel vous souhaitez être alerté. Vous recevrez une notification lorsque le prix du produit passera sous ce seuil." />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          id="threshold-input"
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
                    <FormItem id="alert-provider-select">
                      <FormLabel className="flex items-center">
                        <span>Type d'alerte</span>
                        <OnboardingTooltip content="Choisissez comment vous souhaitez recevoir les alertes. Vous pouvez opter pour des notifications par email ou d'autres moyens disponibles." />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!!isAlertProvidersLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="focus:ring-0">
                            <SelectValue placeholder="Choisir un type d'alerte" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {alertProviders.map((alertProvider) => (
                            <SelectItem
                              value={alertProvider.id}
                              key={alertProvider.id}
                              className="data-[state=checked]:bg-gray-200 data-[state=checked]:text-black"
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
                    <FormItem id="price-type-select">
                      <FormLabel className="flex items-center">
                        <span>Neuf ou d'occasion</span>
                        <OnboardingTooltip content="Indiquez si vous souhaitez suivre le prix des produits neufs ou d'occasion. Cela peut affecter les alertes que vous recevez." />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="focus:ring-0">
                            <SelectValue placeholder="Choisir le type de produit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value={PriceType.NEW}
                            className="data-[state=checked]:bg-gray-200 data-[state=checked]:text-black hover:bg-gray-100"
                          >
                            Neuf
                          </SelectItem>
                          <SelectItem
                            value={PriceType.USED}
                            className="data-[state=checked]:bg-gray-200 data-[state=checked]:text-black hover:bg-gray-100"
                          >
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
                        <FormLabel className="text-base flex items-center gap-2">
                          <span>Activation</span>
                          <OnboardingTooltip content="Activez ou désactivez le suivi de ce produit. Lorsqu'il est activé, vous recevrez des alertes selon vos paramètres." />
                        </FormLabel>
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
                  disabled={isCreateTrackedProductPending}
                >
                  {isCreateTrackedProductPending ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    "Ajouter le produit suivi"
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
