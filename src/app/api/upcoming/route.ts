export async function GET() {
  const DEFAULT_UPCOMING_RELEASES = [
    {
      parentTitle: 'Severance',
      parentType: 'show',
      title: "Season 2, Episode 3: 'The Grim Reaping'",
      releaseType: 'new_episode',
      releaseDate: 'July 20, 2026 (In 7 Days)',
      synopsis:
        'Following the mind-bending premiere of the new season, Mark and the department attempt to decode a scrambled ledger while Milchick places the office under high-security surveillance.',
      isConfirmed: true,
      anticipationScore: 98,
    },
    {
      parentTitle: 'Stranger Things',
      parentType: 'show',
      title: 'Season 5 (The Final Season)',
      releaseType: 'new_season',
      releaseDate: 'Mid 2026',
      synopsis:
        "The final battle for Hawkins begins as Eleven and the gang unite to face Vecna's ultimate plan and close the rift to the Upside Down once and for all.",
      isConfirmed: true,
      anticipationScore: 99,
    },
    {
      parentTitle: 'Dune',
      parentType: 'movie',
      title: 'Dune: Part Three (Messiah)',
      releaseType: 'sequel',
      releaseDate: 'December 2027',
      synopsis:
        "Denis Villeneuve wraps up the Paul Atreides trilogy, adapting Frank Herbert's Dune Messiah as Paul struggles with his absolute rule and religious crusade.",
      isConfirmed: true,
      anticipationScore: 95,
    },
    {
      parentTitle: 'House of the Dragon',
      parentType: 'show',
      title: "Season 3, Episode 2: 'Storm of Ravens'",
      releaseType: 'new_episode',
      releaseDate: 'July 26, 2026 (In 13 Days)',
      synopsis:
        'As the battle lines of the Dance of Dragons harden, Daemon consolidates forces at Harrenhal while Aemond plans a counter-offensive to secure the Riverlands.',
      isConfirmed: true,
      anticipationScore: 94,
    },
    {
      parentTitle: 'Spider-Man',
      parentType: 'movie',
      title: 'Spider-Man: Beyond the Spider-Verse',
      releaseType: 'sequel',
      releaseDate: 'Late 2026',
      synopsis:
        'Miles Morales faces his greatest multiversal challenge yet in the thrilling final chapter of the critically acclaimed animated Spider-Verse trilogy.',
      isConfirmed: false,
      anticipationScore: 97,
    },
    {
      parentTitle: 'The Batman',
      parentType: 'movie',
      title: 'The Batman: Part II',
      releaseType: 'sequel',
      releaseDate: 'October 2, 2026',
      synopsis:
        "Matt Reeves and Robert Pattinson return to Gotham's dark underworld as Bruce Wayne's detective skills are tested by a new rise in theatrical crime.",
      isConfirmed: true,
      anticipationScore: 94,
    },
    {
      parentTitle: 'The White Lotus',
      parentType: 'show',
      title: 'Season 3: Thailand',
      releaseType: 'new_season',
      releaseDate: 'Early 2026',
      synopsis:
        'A fresh group of privileged guests check into the luxury resort in Thailand, dealing with existential dread, spiritual quests, and a brand new mystery.',
      isConfirmed: true,
      anticipationScore: 89,
    },
    {
      parentTitle: 'The Last of Us',
      parentType: 'show',
      title: 'Season 2',
      releaseType: 'new_season',
      releaseDate: 'Late 2025 / Early 2026',
      synopsis:
        "Adapting the gripping events of Part II, Joel and Ellie's past catch up with them in a brutal, emotional journey of revenge and survival.",
      isConfirmed: true,
      anticipationScore: 96,
    },
  ];

  return Response.json({ data: DEFAULT_UPCOMING_RELEASES }, { status: 200 });
}


