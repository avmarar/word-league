const steps = [
  {
    title: "Guess the word",
    body: "Everyone gets the same five-letter word each day. You have six attempts to find it.",
  },
  {
    title: "Submit valid words",
    body: "Type a five-letter word and press Enter or tap the on-screen keyboard. Only words from the game dictionary count.",
  },
  {
    title: "Use the colour hints",
    body: "After each guess, tiles change colour to show how close you are.",
  },
  {
    title: "Climb the leaderboard",
    body: "Win with fewer guesses and faster times to rank higher. Share your emoji result with the team.",
  },
];

const tileHints = [
  {
    label: "Correct letter, correct spot",
    example: "A",
    className: "border-emerald-500 bg-emerald-500 text-white",
  },
  {
    label: "Correct letter, wrong spot",
    example: "B",
    className: "border-amber-500 bg-amber-500 text-white",
  },
  {
    label: "Letter not in the word",
    example: "C",
    className: "border-zinc-600 bg-zinc-600 text-white",
  },
];

export function HowToPlay() {
  return (
    <section className="rounded-3xl border border-white/5 bg-white/[0.04] p-8">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">
        How to play
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Rules at a glance</h2>
      <p className="mt-3 max-w-2xl text-white/70">
        A new puzzle unlocks every day at midnight (office time). Each daily
        challenge rotates between easy, medium, and hard word pools. You can also
        practice anytime at a difficulty level you choose — practice rounds do
        not affect your streak or leaderboard rank.
      </p>

      <ol className="mt-6 space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-200">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold text-white">{step.title}</h3>
              <p className="mt-1 text-sm text-white/70">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
          <h3 className="font-semibold text-white">Daily challenge</h3>
          <p className="mt-2 text-sm text-white/70">
            One ranked puzzle per day. Difficulty alternates between easy,
            medium, and hard. Scores count toward the office leaderboard and your
            streak.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
          <h3 className="font-semibold text-white">Practice mode</h3>
          <p className="mt-2 text-sm text-white/70">
            Pick easy, medium, or hard and play unlimited rounds. Great for
            learning — no pressure on your daily score.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
          Tile colours
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {tileHints.map((hint) => (
            <div
              key={hint.label}
              className="flex items-center gap-3 rounded-2xl bg-black/20 p-4"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold ${hint.className}`}
              >
                {hint.example}
              </span>
              <p className="text-sm text-white/70">{hint.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-white/70">
        <p>
          <span className="font-semibold text-white">Example:</span> If the word
          is CRANE and you guess PLANT, the A and N turn green because they are
          in the right spots.
        </p>
        <p className="mt-2">
          You can play the daily challenge once per day for a ranked score. Use
          practice mode to keep sharpening your skills between dailies.
        </p>
      </div>
    </section>
  );
}
