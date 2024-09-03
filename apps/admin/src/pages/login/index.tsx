import { AuthPage } from "@refinedev/mui";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{
        defaultValues: { email: "", password: "" },
      }}
      registerLink={false}
      forgotPasswordLink={false}
      rememberMe={false}
    />
  );
};
