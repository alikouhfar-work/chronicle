'use client';

import { useState } from 'react';
import { useRef } from 'react';
import { IconAlertCircle, IconLoader2 } from '@tabler/icons-react';
import { createComment } from '@/modules/comments/services/createComment';

type CommentComposerProps = {
  mediaType: string;
  mediaId: string;
};

const MAX_CONTENT_LENGTH = 2000;

export const CommentComposer = ({ mediaType, mediaId }: CommentComposerProps) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<{ id: string; url: string; mimeType: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    const filesArray = Array.from(files);
    if (attachments.length + filesArray.length > 4) {
      setError('Maximum of 4 attachments allowed.');
      return;
    }

    setPending(true);
    setError(null);

    const uploaded: { id: string; url: string; mimeType: string }[] = [];
    for (const file of filesArray) {
      const formData = new FormData();
      formData.set('fileName', file.name);
      formData.set('contentType', file.type);
      formData.set('contentLength', String(file.size));

      const uploadResponse = await fetch('/api/comments/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed.');
      }

      const uploadData = await uploadResponse.json();
      const key = uploadData.key;
      const url = uploadData.url;

      uploaded.push({ id: key, url, mimeType: file.type });
    }

    setAttachments(uploaded);
    setPending(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPending(true);
    const result = await createComment(undefined, {
      mediaType,
      mediaId,
      content: content.trim(),
      attachmentIds: attachments.map((a) => a.id),
    });

    if (result.success) {
      setContent('');
      setAttachments([]);
    } else {
      setError(result.error ?? 'Could not create comment.');
    }
    setPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_CONTENT_LENGTH}
        placeholder="Share your thoughts..."
        rows={3}
        className="w-full rounded-2xl border border-white/10 bg-white/4 p-3 text-base leading-relaxed text-white placeholder-zinc-500 focus:ring-2 focus:ring-violet-400/20 focus:outline-none sm:text-xs"
      />

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div key={att.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={att.url} alt="Attachment preview" className="aspect-video w-24 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => void handleFileSelect(e.target.files)}
      />

      <button
        type="submit"
        disabled={pending || content.trim().length === 0}
        className="apple-pill-btn inline-flex items-center gap-2 bg-violet-500 px-5 py-2.5 text-sm text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <IconLoader2 size={16} className="animate-spin" /> : null}
        Post Comment
      </button>

      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <IconAlertCircle size={15} className="mt-px shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </form>
  );
};
