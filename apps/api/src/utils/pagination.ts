import { HonoRequest } from "hono";

export const getPaginationParams = (req: HonoRequest) => {
  const page = parseInt(req.query("page") || "1");
  const limit = parseInt(req.query("limit") || "10");
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
