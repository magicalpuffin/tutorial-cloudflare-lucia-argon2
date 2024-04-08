// src/routes/+page.server.ts
import { redirect, fail } from "@sveltejs/kit";
import { initializeLucia } from "$lib/server/auth";

import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (!event.locals.user) redirect(302, "/login");

  return {
    username: event.locals.user.username,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const lucia = initializeLucia(event.platform!.env.DB);

    if (!event.locals.session) {
      return fail(401);
    }
    await lucia.invalidateSession(event.locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });
    redirect(302, "/login");
  },
};
