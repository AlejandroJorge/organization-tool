import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { APP_SESSION_COOKIE } from "$lib/server/config";

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete(APP_SESSION_COOKIE, { path: "/" });
  throw redirect(303, "/login");
};
