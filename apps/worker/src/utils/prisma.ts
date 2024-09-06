import { PrismaClient } from "@repo/prisma-client";
import dotenv from "dotenv";

dotenv.config();

export const prisma = new PrismaClient();
