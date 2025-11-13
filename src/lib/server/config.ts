import { env } from "$env/dynamic/private";

const normalize = (value?: string) => value?.trim() ?? "";

const isValidTimezone = (value: string) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

const resolveTimezone = (value?: string) => {
  const normalized = normalize(value) || "UTC";
  return isValidTimezone(normalized) ? normalized : "UTC";
};

export const APP_SESSION_COOKIE = "app_session";

export const appConfig = {
  authEnabled: normalize(env.AUTH).toLowerCase() === "true",
  applicationSecret: normalize(env.APPLICATION_SECRET),
  databaseUrl: normalize(env.DATABASE_URL),
  workspaceTimezone: resolveTimezone(env.WORKSPACE_TIMEZONE)
};
