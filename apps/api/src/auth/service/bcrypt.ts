import { Bcrypt } from "oslo/password";

export const { hash, verify } = new Bcrypt({
  cost: 12,
});
