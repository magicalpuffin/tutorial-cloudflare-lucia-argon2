// src/routes/login/+page.server.ts
import { initializeLucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { initializeDrizzle } from "$lib/db/db";
import { userTable } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { CloudflareArgon2 } from "$lib/server/argon2";

import type { Actions } from "./$types";

export const actions: Actions = {
  default: async (event) => {
    const lucia = initializeLucia(event.platform!.env.DB);
    const db = initializeDrizzle(event.platform!.env.DB);

    const formData = await event.request.formData();
    const username = formData.get("username");
    const password = formData.get("password");

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

    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.username, username.toLocaleLowerCase()),
    });

    if (!existingUser) {
      return fail(400, {
        message: "Incorrect username or password",
      });
    }

    const validPassword = await new CloudflareArgon2(
      event.platform!.env.ARGON2
    ).verify(existingUser.hashedPassword ?? "", password);
    if (!validPassword) {
      return fail(400, {
        message: "Incorrect username or password",
      });
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });

    redirect(302, "/");
  },
};
