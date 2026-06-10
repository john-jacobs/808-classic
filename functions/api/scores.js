import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { requireActiveTripRound } from "../_lib/resource.js";
import { supabaseRequest } from "../_lib/supabase.js";

export const onRequestPost = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await readJson(context.request);
  const holeNumber = Number(input.holeNumber);
  const strokes = Number(input.strokes);

  if (!input.roundId || !input.memberId) return apiError(400, "roundId and memberId are required");
  if (!Number.isInteger(holeNumber) || holeNumber < 1 || holeNumber > 36) return apiError(400, "Invalid hole number");
  if (!Number.isInteger(strokes) || strokes < 1 || strokes > 20) return apiError(400, "Invalid stroke count");

  await requireActiveTripRound(context.env, input.roundId);

  const roundPlayers = await supabaseRequest(
    context.env,
    `/rest/v1/round_players?select=round_id,member_id&round_id=eq.${input.roundId}&member_id=eq.${input.memberId}&limit=1`,
  );
  if (!roundPlayers?.length) return apiError(404, "Player is not entered in this round");

  const scores = await supabaseRequest(context.env, "/rest/v1/hole_scores?on_conflict=round_id,member_id,hole_number&select=*", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=representation" },
    body: {
      round_id: input.roundId,
      member_id: input.memberId,
      hole_number: holeNumber,
      strokes,
      entered_by: member.id,
      updated_at: new Date().toISOString(),
    },
  });

  return json({ score: scores[0] });
});
