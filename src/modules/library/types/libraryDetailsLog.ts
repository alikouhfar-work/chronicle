export type LibraryDetailsLogState = {
  success: boolean;
  error?: string;
};

export type LibraryDetailsLogAction = (
  state: LibraryDetailsLogState,
  formData: FormData,
) => Promise<LibraryDetailsLogState>;
