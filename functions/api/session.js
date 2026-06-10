import { withApiErrors } from "../_lib/handler.js";
import { json } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";

export const onRequestGet = withApiErrors(async (context) => {
  const member = await requireMember(context);
  return json({
    member,
    groupId: context.env.SUPABASE_GROUP_ID,
    tripId: context.env.SUPABASE_TRIP_ID,
  });
});
