export type CrewRaw = {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  credit_id: string;
  department: string;
  job: string;
};

export type Crew = {
  id: number;
  job: string;
  name: string;
  profilePath: string;
};
