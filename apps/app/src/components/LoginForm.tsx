import {
  Form,
  FormField,
  Button,
  Input,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Alert,
  AlertTitle,
  AlertDescription,
  ExclamationTriangleIcon,
} from "@repo/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { client } from "../api/utils";
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

export const LoginForm = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    const response = await client.auth.login.$post({
      json: data,
    });

    if (response.ok) {
      navigate({
        to: "/",
      });
    } else {
      if (response.status === 401) {
        setApiError("Invalid email or password");
      }

      if (response.status === 403) {
        setApiError("Email is not verified");
      }

      setApiError("Something went wrong, please try again");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-2 ">
        {apiError && (
          <Alert variant="destructive" className="mb-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    {...field}
                    className={`w-full p-2 rounded-md ${
                      form.formState.errors.email ? "border-red-500" : ""
                    }`}
                  />
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    className="w-full p-2 rounded-md"
                  />
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
        <Button
          className="w-full py-2 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          type="submit"
          disabled={form.formState.isSubmitting || !form.formState.isValid}
        >
          Sign in
        </Button>
      </form>
    </Form>
  );
};
