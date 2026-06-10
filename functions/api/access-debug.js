import { json } from "../_lib/http.js";

const ACCESS_HEADERS = [
  "cf-access-authenticated-user-email",
  "cf-access-jwt-assertion",
  "cookie",
];

export function onRequestGet(context) {
  const cookieNames = (context.request.headers.get("cookie") || "")
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter(Boolean);

  return json({
    accessHeaders: Object.fromEntries(
      ACCESS_HEADERS.map((header) => [header, context.request.headers.has(header)]),
    ),
    cookieNames,
    cfKeys: Object.keys(context.request.cf || {}).sort(),
  });
}
