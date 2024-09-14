import { Hono } from "hono";
import { object, string, pipe, minLength, email, optional } from "valibot";
import { vValidator } from "@hono/valibot-validator";
import { hash, compare } from "@node-rs/bcrypt";
import { Context } from "@/types/honoContext";
import { prisma } from "@/config/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";
import { lucia } from "@/config/lucia";
import { generateToken } from "@/utils/generateToken";
import { stripe } from "@/stripe/service";
import { emailService } from "@/utils/email";
import { sessionMiddleware } from "./middleware/sessionMiddleware";
import { ADMIN_EMAILS, FRONTEND_URL, NODE_ENV } from "@/config/env";
import { rateLimiterInstance } from "@/utils/rateLimit";

const app = new Hono<Context>();

const loginSchema = object({
  email: pipe(string(), email()),
  password: pipe(string(), minLength(8)),
});

const registerSchema = object({
  email: pipe(string(), email()),
  password: pipe(string(), minLength(8)),
  invitationCode: optional(string()),
});

const forgotPasswordSchema = object({
  email: pipe(string(), email()),
});

const resetPasswordSchema = object({
  password: pipe(string(), minLength(8)),
});

const routes = app
  .post(
    "/login",
    rateLimiterInstance(5, 1),
    vValidator("json", loginSchema),
    async (c) => {
      const { password, email } = c.req.valid("json");

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      const passwordHash = user?.password ?? "$2a$12$" + "a".repeat(53);
      const isValidPassword = await compare(password, passwordHash);

      if (isValidPassword && user) {
        if (!user.isEmailVerified) {
          throw new ForbiddenError("Email is not verified");
        }
        const session = await lucia.createSession(user.id, {});
        c.header(
          "Set-Cookie",
          lucia.createSessionCookie(session.id).serialize(),
          {
            append: true,
          }
        );

        return c.json({ message: "Logged in successfully" });
      } else {
        throw new UnauthorizedError("Invalid email or password");
      }
    }
  )
  .get("/me", sessionMiddleware, async (c) => {
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No user found");
    }

    return c.json({
      id: `${user.id}`,
      email: `${user.email}`,
      isAdmin: user.isAdmin,
    });
  })
  .post(
    "/register",
    rateLimiterInstance(5, 1),
    vValidator("json", registerSchema),
    async (c) => {
      const { password, email, invitationCode } = c.req.valid("json");

      const isAdmin = ADMIN_EMAILS?.split(",").includes(email);

      const invitation = await prisma.invitationCode.findFirst({
        where: {
          code: invitationCode,
          isUsed: false,
        },
      });

      if (!invitation && !isAdmin && NODE_ENV === "production") {
        throw new ForbiddenError("Invalid invitation code");
      }

      const foundUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (foundUser) {
        throw new ConflictError("User already exists");
      }

      const verificationToken = generateToken();

      const user = await prisma.user.create({
        data: {
          email,
          password: await hash(password, 12),
          verificationToken,
          isAdmin,
          emailVerifiedAt: isAdmin ? new Date() : null,
          isEmailVerified: isAdmin,
        },
      });

      if (invitation) {
        await prisma.invitationCode.update({
          where: {
            id: invitation.id,
          },
          data: {
            isUsed: true,
            userId: user.id,
          },
        });
      }

      if (!isAdmin) {
        await emailService.sendWelcomeEmail({
          userEmail: email,
          verifyUrl: `${FRONTEND_URL}/verifier-email/${verificationToken}`,
        });
      }

      return c.json({ message: "User registered" });
    }
  )
  .get("/verify-email/:token", rateLimiterInstance(5, 1), async (c) => {
    const token = c.req.param("token");
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      throw new NotFoundError("Invalid token");
    }

    const customer = await stripe.customers.create({
      email: user.email,
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerifiedAt: new Date(),
        isEmailVerified: true,
        verificationToken: null,
        stripeId: customer.id,
      },
    });

    return c.json({ message: "Email verified" });
  })
  .post(
    "/forgot-password",
    rateLimiterInstance(5, 1),
    vValidator("json", forgotPasswordSchema),
    async (c) => {
      const { email } = c.req.valid("json");

      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        const resetPasswordToken = generateToken();
        const resetPasswordTokenExpiry = new Date(Date.now() + 3600000);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetPasswordToken,
            resetPasswordTokenExpiry,
          },
        });

        await emailService.sendPasswordResetEmail({
          userEmail: email,
          // TODO: Change this to the frontend URL
          resetUrl: `http://localhost:3000/auth/reset-password/${resetPasswordToken}`,
        });
      }

      return c.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }
  )
  .get("/reset-password/:token", rateLimiterInstance(5, 1), async (c) => {
    const token = c.req.param("token");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new NotFoundError("Invalid or expired reset token");
    }

    return c.json({
      message: "Valid reset token. Please submit your new password.",
    });
  })
  .post(
    "/reset-password/:token",
    rateLimiterInstance(5, 1),
    vValidator("json", resetPasswordSchema),
    async (c) => {
      const token = c.req.param("token");
      const { password } = c.req.valid("json");

      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordTokenExpiry: { gt: new Date() },
        },
      });

      if (!user) {
        throw new NotFoundError("Invalid or expired reset token");
      }

      const hashedPassword = await hash(password, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordTokenExpiry: null,
        },
      });

      // since the password has been reset, invalidate all user sessions
      await lucia.invalidateUserSessions(user.id);

      return c.json({ message: "Password has been reset successfully" });
    }
  )
  .post("/logout", sessionMiddleware, async (c) => {
    const session = c.get("session");

    if (!session) {
      throw new UnauthorizedError("No session found");
    }

    await lucia.invalidateSession(session.id);

    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {});

    return c.json({ message: "Logged out successfully" });
  });

export { routes as authRoutes };
