import { formatDuration } from "@/lib/dates";
import type { ScoreDocument } from "@/lib/game/types";

type LeaderboardTableProps = {
  scores: ScoreDocument[];
  streaks?: Record<string, number>;
  title: string;
};

export function LeaderboardTable({
  scores,
  streaks = {},
  title,
}: LeaderboardTableProps) {
  const winners = scores
    .filter((score) => score.won)
    .sort((a, b) => {
      if (a.attempts !== b.attempts) {
        return a.attempts - b.attempts;
      }
      return a.durationMs - b.durationMs;
    });

  const didNotFinish = scores.filter((score) => !score.won);

  return (
    <section className="rounded-3xl border border-white/5 bg-white/[0.04] p-6">
      <h2 className="mb-4 text-xl font-semibold text-white">{title}</h2>

      {winners.length === 0 && didNotFinish.length === 0 ? (
        <p className="text-white/60">No scores yet. Be the first to play!</p>
      ) : (
        <div className="space-y-6">
          {winners.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/60">
                    <th className="py-2 pr-4">Rank</th>
                    <th className="py-2 pr-4">Player</th>
                    <th className="py-2 pr-4">Attempts</th>
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map((score, index) => (
                    <tr key={score.userId} className="border-b border-white/5">
                      <td className="py-3 pr-4 font-semibold text-cyan-200">
                        #{index + 1}
                      </td>
                      <td className="py-3 pr-4">{score.displayName}</td>
                      <td className="py-3 pr-4">{score.attempts}/6</td>
                      <td className="py-3 pr-4">
                        {formatDuration(score.durationMs)}
                      </td>
                      <td className="py-3">
                        {streaks[score.userId] ? (
                          <span className="rounded-full bg-amber-400/20 px-2 py-1 text-xs text-amber-200">
                            {streaks[score.userId]} day streak
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {didNotFinish.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
                Did not finish
              </h3>
              <ul className="space-y-2 text-sm text-white/70">
                {didNotFinish.map((score) => (
                  <li key={score.userId}>
                    {score.displayName} — {score.attempts}/6 attempts
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
