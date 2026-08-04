import { Flame, Medal } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/dates";
import type { ScoreDocument } from "@/lib/game/types";
import { cn } from "@/lib/utils";

type LeaderboardTableProps = {
  scores: ScoreDocument[];
  streaks?: Record<string, number>;
  title: string;
};

function rankBadge(index: number) {
  if (index === 0) return { icon: Medal, className: "text-[color:var(--hint)]" };
  if (index === 1) return { icon: Medal, className: "text-muted-foreground" };
  if (index === 2) return { icon: Medal, className: "text-[color:var(--tile-present)]" };
  return null;
}

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
    <SectionCard title={title}>
      {winners.length === 0 && didNotFinish.length === 0 ? (
        <EmptyState
          icon={Medal}
          title="No scores yet"
          description="Be the first to finish today's puzzle and claim the top spot."
        />
      ) : (
        <div className="space-y-6">
          {winners.length > 0 && (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <caption className="sr-only">{title} rankings</caption>
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th scope="col" className="py-2 pr-4">
                        Rank
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        Player
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        Attempts
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        Time
                      </th>
                      <th scope="col" className="py-2">
                        Streak
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.map((score, index) => {
                      const badge = rankBadge(index);
                      return (
                        <tr key={score.userId} className="border-b border-border/60">
                          <td className="py-3 pr-4">
                            <span className="flex items-center gap-2 font-display font-semibold text-primary">
                              {badge ? (
                                <badge.icon
                                  aria-hidden="true"
                                  className={cn("size-4", badge.className)}
                                />
                              ) : null}
                              #{index + 1}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-medium">{score.displayName}</td>
                          <td className="py-3 pr-4">{score.attempts}/6</td>
                          <td className="py-3 pr-4">
                            {formatDuration(score.durationMs)}
                          </td>
                          <td className="py-3">
                            {streaks[score.userId] ? (
                              <Badge variant="outline" className="gap-1 border-[color:var(--hint)]/30 bg-[color:var(--hint)]/10 text-[color:var(--hint)]">
                                <Flame aria-hidden="true" className="size-3" />
                                {streaks[score.userId]} day streak
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden" role="list" aria-label={`${title} rankings`}>
                {winners.map((score, index) => {
                  const badge = rankBadge(index);
                  return (
                    <div
                      key={score.userId}
                      role="listitem"
                      className="rounded-xl border border-border/60 bg-muted/30 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-display font-semibold text-primary">
                          {badge ? (
                            <badge.icon
                              aria-hidden="true"
                              className={cn("size-4", badge.className)}
                            />
                          ) : null}
                          #{index + 1} {score.displayName}
                        </span>
                        <span className="text-sm">{score.attempts}/6</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                        <span>{formatDuration(score.durationMs)}</span>
                        {streaks[score.userId] ? (
                          <Badge variant="outline" className="gap-1 border-[color:var(--hint)]/30 text-[color:var(--hint)]">
                            <Flame aria-hidden="true" className="size-3" />
                            {streaks[score.userId]} day streak
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {didNotFinish.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Did not finish
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
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
    </SectionCard>
  );
}
