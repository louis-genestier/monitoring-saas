import type { AuthProvider } from "@refinedev/core";
import { client } from "@repo/front-logic";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const response = await client.admin.login.$post({
      json: {
        email,
        password,
      },
    });

    if (response.status === 200) {
      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    await client.auth.logout.$post({});
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const response = await client.auth.me.$get({});
    const user = await response.json();
    if (response.status === 200 && user.isAdmin) {
      return {
        authenticated: true,
      };
    }

    await client.auth.logout.$post({});

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const response = await client.auth.me.$get({});
    if (response.status === 200) {
      return {
        id: 1,
        name: "louis",
        avatar: "https://i.pravatar.cc/300",
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
