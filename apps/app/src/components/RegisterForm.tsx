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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(12, "Password must be at least 12 characters"),
    confirmPassword: z
      .string()
      .min(12, "Password must be at least 12 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        json: data,
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        if (response.status === 409) {
          setApiError("Email already in use");
        } else {
          setApiError("Something went wrong, please try again");
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
        {apiError && (
          <Alert variant="destructive" className="mb-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-2">
            <CheckCircledIcon className="w-5 h-5" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Account created successfully, please verify your email to login.
            </AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="john@example.com"
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
              <FormLabel>Password</FormLabel>
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
              <FormLabel>Confirm Password</FormLabel>
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
          Create Account
        </Button>
      </form>
    </Form>
  );
};
