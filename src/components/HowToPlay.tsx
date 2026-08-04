import { Repeat2, Swords } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TILE_EMPTY_CLASS,
  TILE_STATE_CLASSES,
} from "@/lib/game/tile-colors";
import { cn } from "@/lib/utils";

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
    className: TILE_STATE_CLASSES.correct,
  },
  {
    label: "Correct letter, wrong spot",
    example: "B",
    className: TILE_STATE_CLASSES.present,
  },
  {
    label: "Letter not in the word",
    example: "C",
    className: TILE_STATE_CLASSES.absent,
  },
];

export function HowToPlay() {
  return (
    <SectionCard>
      <PageHeader
        eyebrow="Guide"
        title="How to play"
        description="A new puzzle unlocks every day at midnight (office time). Each daily challenge rotates between easy, medium, and hard word pools. Practice anytime without affecting your streak or rank."
        className="mb-6"
      />

      <Separator className="mb-6" />

      <h2 className="sr-only">Rules at a glance</h2>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <Badge className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary hover:bg-primary/15">
              {index + 1}
            </Badge>
            <div>
              <h3 className="font-display font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <Separator className="my-8" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Swords aria-hidden="true" className="size-4 text-primary" />
            <h3 className="font-display font-semibold">Daily challenge</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            One ranked puzzle per day. Difficulty alternates between easy,
            medium, and hard. Scores count toward the office leaderboard and your
            streak.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Repeat2 aria-hidden="true" className="size-4 text-secondary" />
            <h3 className="font-display font-semibold">Practice mode</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick easy, medium, or hard and play unlimited rounds. Great for
            learning — no pressure on your daily score.
          </p>
        </div>
      </div>

      <Separator className="my-8" />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Tile colours
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {tileHints.map((hint) => (
            <div
              key={hint.label}
              className="flex items-center gap-3 rounded-2xl bg-muted/30 p-4"
            >
              <span
                className={cn(
                  "game-tile flex size-10 items-center justify-center text-lg",
                  hint.className
                )}
              >
                {hint.example}
              </span>
              <p className="text-sm text-muted-foreground">{hint.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <span className={cn("game-tile size-10 border-2", TILE_EMPTY_CLASS)} />
          <p className="self-center text-sm text-muted-foreground">
            Empty tile — type a letter to fill it in.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Example:</span> If the word
          is CRANE and you guess PLANT, the A and N turn green because they are
          in the right spots.
        </p>
        <p className="mt-2">
          You can play the daily challenge once per day for a ranked score. Use
          practice mode to keep sharpening your skills between dailies. Each game
          includes one hint that reveals the word&apos;s meaning.
        </p>
      </div>
    </SectionCard>
  );
}
