export type RouteContext<
  Params extends Record<string, string> = { type: string; id: string },
> = {
  params: Promise<Params>;
};

export type FilesRouteContext = {
  params: Promise<{ key: string[] }>;
};
