import { zodResolver } from "@hookform/resolvers/zod";
import { client } from "@repo/front-logic";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  Input,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@repo/ui/";
import { useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email("Adresse e-mail invalide"),
    password: z
      .string()
      .min(12, "Le mot de passe doit contenir au moins 12 caractères"),
    confirmPassword: z
      .string()
      .min(12, "Le mot de passe doit contenir au moins 12 caractères"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const search = useSearch({
    from: "/login",
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await client.auth.register.$post({
        json: {
          email: data.email,
          password: data.password,
          invitationCode: `${search.invitationCode}`,
        },
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        if (response.status === 409) {
          setApiError("Cet e-mail est déjà utilisé");
        } else if (response.status === 403) {
          setApiError("Code d'invitation invalide");
        } else {
          setApiError("Une erreur s'est produite, veuillez réessayer");
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setApiError("Une erreur inattendue s'est produite. Veuillez réessayer.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
        {apiError && (
          <Alert variant="destructive" className="mb-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-2">
            <CheckCircledIcon className="w-5 h-5" />
            <AlertTitle>Succès</AlertTitle>
            <AlertDescription>
              Compte créé avec succès, veuillez vérifier votre e-mail pour vous
              connecter.
            </AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="jean@exemple.com"
                  className="w-full p-2 rounded-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-2 rounded-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-2 rounded-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full py-2 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={form.formState.isSubmitting || !form.formState.isValid}
        >
          Créer un compte
        </Button>
      </form>
    </Form>
  );
};
