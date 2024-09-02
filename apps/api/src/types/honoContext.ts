import { Env } from "hono";
import { Session, User } from "lucia";

export interface Context extends Env {
  Variables: {
    user: User | null;
    session: Session | null;
  };
}
