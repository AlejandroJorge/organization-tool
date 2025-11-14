import type { LayoutServerLoad } from "./$types";
import { appConfig } from "$lib/server/config";

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    auth: {
      isAuthenticated: locals.auth?.isAuthenticated ?? false
    },
    user: locals.user,
    workspaceTimezone: appConfig.workspaceTimezone
  };
};
