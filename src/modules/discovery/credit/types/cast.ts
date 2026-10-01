export type CastRaw = {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  character: string;
  credit_id: string;
  order: number;
};

export type Cast = {
  id: number;
  name: string;
  order: number;
  character: string;
  profilePath: string;
};
