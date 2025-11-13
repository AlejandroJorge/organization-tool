import { toast } from "$lib/components/toast-store";
import type { SubmitFunction } from "@sveltejs/kit";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

const extractJsonMessage = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json"))
    return null;
  try {
    const payload = (await response.json()) as { message?: string } | null;
    if (payload && typeof payload.message === "string" && payload.message.trim())
      return payload.message;
  } catch (error) {
    console.error("[toast-errors] Unable to parse error payload", error);
  }
  return null;
};

const extractTextMessage = async (response: Response) => {
  try {
    const text = (await response.text())?.trim();
    return text || null;
  } catch (error) {
    console.error("[toast-errors] Unable to read error response", error);
  }
  return null;
};

const getResponseErrorMessage = async (response: Response, fallbackMessage: string) => {
  return (await extractJsonMessage(response)) ?? (await extractTextMessage(response)) ?? fallbackMessage;
};

const resolveErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error && error.message)
    return error.message;
  return fallbackMessage;
};

export const fetchWithErrorToast = async (
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1],
  fallbackMessage = DEFAULT_ERROR_MESSAGE
) => {
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      const message = await getResponseErrorMessage(response, fallbackMessage);
      throw new Error(message);
    }
    return response;
  } catch (error) {
    toast.error(resolveErrorMessage(error, fallbackMessage));
    return null;
  }
};

type FormEnhancerOptions = {
  onSuccess?: () => void;
  fallbackMessage?: string;
};

export const createErrorToastEnhancer = (options: FormEnhancerOptions = {}): SubmitFunction => {
  const { onSuccess, fallbackMessage = DEFAULT_ERROR_MESSAGE } = options;

  return () => {
    return async ({ result, update }) => {
      if (result.type === "success") {
        onSuccess?.();
      } else if (result.type === "failure") {
        const payload = (result.data as { message?: string } | null) ?? null;
        const message = payload?.message?.trim() || fallbackMessage;
        toast.error(message);
      } else if (result.type === "error") {
        const message = result.error?.message?.trim() || fallbackMessage;
        toast.error(message);
      }

      await update();
    };
  };
};

export const toastErrors = {
  fetchWithErrorToast,
  createErrorToastEnhancer,
};
