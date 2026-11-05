export type StoredObjectView = {
  key: string;
  lastModified: Date | null;
};

export const DEFAULT_SWEEP_GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * Decides which stored objects are orphans: present in the bucket but not
 * referenced by any attachment row, and old enough that an upload whose comment
 * is still being composed cannot be swept out from under it.
 *
 * Pure on purpose — the sweep route only fetches inputs and deletes results.
 */
export const planAttachmentSweep = (params: {
  objects: StoredObjectView[];
  referencedKeys: Set<string>;
  now: Date;
  graceMs?: number;
}): string[] => {
  const graceMs = params.graceMs ?? DEFAULT_SWEEP_GRACE_MS;

  return params.objects
    .filter((object) => !params.referencedKeys.has(object.key))
    .filter((object) => object.lastModified !== null)
    .filter(
      (object) => params.now.getTime() - (object.lastModified as Date).getTime() >= graceMs,
    )
    .map((object) => object.key);
};
