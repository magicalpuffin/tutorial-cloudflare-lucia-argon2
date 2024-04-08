// src/routes/signup/+page.server.ts
import { initializeLucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { generateId } from "lucia";
import { userTable } from "$lib/db/schema";
import { initializeDrizzle } from "$lib/db/db";
import { CloudflareArgon2 } from "$lib/server/argon2";

import type { Actions } from "./$types";
import { eq } from "drizzle-orm";

export const actions: Actions = {
  default: async (event) => {
    const lucia = initializeLucia(event.platform!.env.DB);
    const db = initializeDrizzle(event.platform!.env.DB);

    const formData = await event.request.formData();
    const username = formData.get("username");
    const password = formData.get("password");
    // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
    // keep in mind some database (e.g. mysql) are case insensitive
    if (
      typeof username !== "string" ||
      username.length < 3 ||
      username.length > 31 ||
      !/^[a-z0-9_-]+$/.test(username)
    ) {
      return fail(400, {
        message: "Invalid username",
      });
    }
    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      return fail(400, {
        message: "Invalid password",
      });
    }

    const userId = generateId(15);
    const hashedPassword = await new CloudflareArgon2(
      event.platform!.env.ARGON2
    ).hash(password);

    // Check if username is already used
    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.username, username),
    });

    if (existingUser) {
      return fail(400, {
        message: "Username already taken",
      });
    }

    // maybe return user?
    await db.insert(userTable).values({ id: userId, username, hashedPassword });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });

    redirect(302, "/");
  },
};
