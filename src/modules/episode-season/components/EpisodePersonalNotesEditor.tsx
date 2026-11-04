'use client';

import { useState } from 'react';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { LibraryDetailsLogModal } from '@/modules/library/components/details/LibraryDetailsLogModal';
import { addEpisodeLog } from '@/modules/episode-season/actions/addEpisodeLog';
import type { EpisodePersonalNotesEditorProps } from '@/modules/episode-season/types/episodePersonalNotesEditor';

/**
 * Add/edit affordance for the Personal Notes tab on the episode detail page.
 * Reuses the existing episode log action so ratings/notes stay in
 * EpisodeTracking; no new notes model is introduced.
 */
export const EpisodePersonalNotesEditor = ({
  episodeId,
  episodeName,
  rating,
  notes,
}: EpisodePersonalNotesEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const hasNotes = Boolean(rating || notes?.trim());

  return (
    <>
      {isEditing && (
        <LibraryDetailsLogModal
          icon={<IconEdit size={18} className="text-violet-400" />}
          title={`Personal notes: ${episodeName}`}
          hiddenFields={{ episodeId }}
          initialRating={rating ?? 0}
          initialNotes={notes ?? ''}
          action={addEpisodeLog}
          onClose={() => setIsEditing(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className={
          hasNotes
            ? 'apple-pill-btn cursor-pointer border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/12'
            : 'apple-pill-btn cursor-pointer bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:bg-violet-400'
        }
      >
        {hasNotes ? <IconEdit size={14} /> : <IconPlus size={14} />}
        {hasNotes ? 'Edit personal notes' : 'Add personal notes'}
      </button>
    </>
  );
};

export default EpisodePersonalNotesEditor;
