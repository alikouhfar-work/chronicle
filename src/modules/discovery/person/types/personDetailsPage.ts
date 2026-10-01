export type PersonDetailsParams = {
  id: string;
};

export type PersonDetailsPageProps = {
  params: Promise<PersonDetailsParams>;
};
