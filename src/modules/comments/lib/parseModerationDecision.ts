import { isRecord, invalid, parseOneOf, parsed } from '@/shared/lib/parse';
import type { ParseResult } from '@/shared/lib/parse';

/** The two decisions the operator endpoint accepts. */
export const MODERATION_ACTIONS = ['hide', 'dismiss'] as const;
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

export type ModerationDecisionBody = {
  commentId: string;
  action: ModerationAction;
  reason?: string;
};

/**
 * Body of `POST /api/moderation/reports`. Kept next to the route's service so the
 * accepted shape is defined once, not inferred from the `as` cast in the handler.
 */
export const parseModerationDecision = (input: unknown): ParseResult<ModerationDecisionBody> => {
  if (!isRecord(input)) {
    return invalid('Expected { commentId, action: "hide" | "dismiss", reason? }.');
  }

  const { commentId, action, reason } = input;

  if (typeof commentId !== 'string' || commentId.trim().length === 0) {
    return invalid('commentId must be a non-empty string.');
  }

  const parsedAction = parseOneOf(action, MODERATION_ACTIONS, 'action');
  if (!parsedAction.ok) return parsedAction;

  if (reason !== undefined && reason !== null && typeof reason !== 'string') {
    return invalid('reason must be a string when present.');
  }

  return parsed({
    commentId,
    action: parsedAction.value,
    ...(typeof reason === 'string' ? { reason } : {}),
  });
};
