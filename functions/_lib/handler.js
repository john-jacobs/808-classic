import { apiError } from "./http.js";

export function withApiErrors(handler) {
  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      console.error(error);
      return apiError(error.status || 500, error.status ? error.message : "Backend request failed");
    }
  };
}
