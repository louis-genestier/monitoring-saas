import {
  Button,
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from "@repo/ui";
import {
  useCheckoutSession,
  useCreateCheckoutSession,
} from "../queries/stripe.queries";
import { useProfile } from "../queries/user.queries";
import { useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

export const Parameters = () => {
  const search = useSearch({
    from: "/_authenticated/parametres",
  });
  const { data: session } = useCheckoutSession(search.session_id ?? "");
  const { mutate } = useCreateCheckoutSession();
  const { data: profile } = useProfile();

  const email = profile?.email ?? "";

  const form = useForm({
    resolver: zodResolver(z.object({ email: z.string().email() })),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (email) form.setValue("email", email);
  }, [email, form]);

  console.log("render");

  return (
    <div className="flex flex-col gap-4 mx-4 bg-white rounded-lg p-4 mt-4 xl:mx-auto xl:w-4/5 xl:mt-12">
      <h1 className="text-xl font-bold">Mes paramètres</h1>
      {/* <FormField
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
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                id="threshold-input"
              />
            </FormControl>
            <FormDescription>
              Définir le seuil de prix pour les alertes
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      /> */}
      <Form {...form}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-md">Adresse email:</FormLabel>
              <Input {...field} disabled type="email" />
              <FormDescription>
                C'est l'adresse email sur laquelle vous aller recevoir les
                alertes.
              </FormDescription>
            </FormItem>
          )}
        />
      </Form>
      <div>
        <p>
          Abonnement actuel:{" "}
          {profile?.subscription ? (
            <span>{profile.subscription.planName}</span>
          ) : (
            "gratuit"
          )}
        </p>
        {profile?.subscription && (
          <Button
            className="bg-accent hover:bg-accent/90"
            onClick={() => {
              window.location.href =
                "https://billing.stripe.com/p/login/test_4gweVPaQz7yy5t6144";
            }}
          >
            Gérer mon abonnement
          </Button>
        )}
      </div>
      {/* {session?.id && (
        <div>
          <p>Merci de votre abonnement !</p>
        </div>
      )}
      <Button onClick={() => mutate("price_1PxZjgJ7j1FFV5bIABXKNc18")}>
        Test lol
      </Button> */}
      {/* {profile?.subscription && (
        <div>
          <p>You are subscribed to {profile.subscription.planName} plan.</p>
          <p>Next billing date: {profile.subscription.currentPeriodEnd}</p>
          <Button
            onClick={() =>
              (window.location.href =
                "https://billing.stripe.com/p/login/test_4gweVPaQz7yy5t6144")
            }
          >
            Manage subscription
          </Button>
        </div>
      )} */}
    </div>
  );
};
