"use server";

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import ratelimit from "../ratelimit";
import { redirect } from "next/navigation";

export const signup = async (params: AuthCredentials) => {
  const { email, password, fullName, universityCard, universityId } = params;
  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return redirect("/too-fast");
  }
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }
  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      email,
      password: hashedPassword,
      fullName,
      universityCard,
      universityId,
    });

    await signInWithCredentials({ email, password });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create user" };
  }
};
export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">
) => {
  const { email, password } = params;
  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return redirect("/too-fast");
  }
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    console.log(result);

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to sign in" };
  }
};
