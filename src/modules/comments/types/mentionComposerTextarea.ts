import type { PublicUser } from '@/modules/user/types';

export type ActiveMention = { start: number; end: number; query: string };

export type MentionSearchPayload = { users?: PublicUser[] };

export type MentionComposerTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  mentionIds: Set<string>;
  onMentionIdsChange: (ids: Set<string>) => void;
  disabled: boolean;
  placeholder?: string;
  maxLength?: number;
  invalid?: boolean;
};
