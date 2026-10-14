import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile: (params) => ({
        email: typeof params.email === "string" ? params.email.trim() : "",
        ...(typeof params.name === "string" && params.name.trim().length > 0
          ? { name: params.name.trim() }
          : {}),
      }),
    }),
  ],
});
