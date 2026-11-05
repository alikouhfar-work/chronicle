import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SWEEP_GRACE_MS,
  planAttachmentSweep,
} from '@/modules/comments/lib/planAttachmentSweep';

const now = new Date('2026-11-05T12:00:00.000Z');
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

describe('planAttachmentSweep', () => {
  it('keeps referenced objects regardless of age', () => {
    const orphans = planAttachmentSweep({
      objects: [{ key: 'comment-attachments/used.png', lastModified: hoursAgo(1000) }],
      referencedKeys: new Set(['comment-attachments/used.png']),
      now,
    });

    expect(orphans).toEqual([]);
  });

  it('deletes unreferenced objects older than the grace window', () => {
    const orphans = planAttachmentSweep({
      objects: [
        { key: 'comment-attachments/abandoned.png', lastModified: hoursAgo(48) },
        { key: 'comment-attachments/fresh.png', lastModified: hoursAgo(1) },
      ],
      referencedKeys: new Set(),
      now,
    });

    expect(orphans).toEqual(['comment-attachments/abandoned.png']);
  });

  it('respects a custom grace window', () => {
    const objects = [{ key: 'comment-attachments/a.png', lastModified: hoursAgo(2) }];

    expect(planAttachmentSweep({ objects, referencedKeys: new Set(), now, graceMs: 60 * 60 * 1000 }))
      .toEqual(['comment-attachments/a.png']);
    expect(planAttachmentSweep({ objects, referencedKeys: new Set(), now, graceMs: 4 * 60 * 60 * 1000 }))
      .toEqual([]);
  });

  it('skips objects whose age is unknown rather than guessing', () => {
    const orphans = planAttachmentSweep({
      objects: [{ key: 'comment-attachments/unknown.png', lastModified: null }],
      referencedKeys: new Set(),
      now,
    });

    expect(orphans).toEqual([]);
  });

  it('defaults to a 24 hour grace window', () => {
    expect(DEFAULT_SWEEP_GRACE_MS).toBe(24 * 60 * 60 * 1000);
  });

  it('is a pure plan — inputs are untouched', () => {
    const objects = [{ key: 'comment-attachments/a.png', lastModified: hoursAgo(48) }];
    const referencedKeys = new Set<string>();

    planAttachmentSweep({ objects, referencedKeys, now });

    expect(objects).toHaveLength(1);
    expect(referencedKeys.size).toBe(0);
  });
});
