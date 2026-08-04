import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/SectionCard";
import { cn } from "@/lib/utils";

type ProfileFormCardProps = {
  nickname: string;
  onNicknameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  canSubmit: boolean;
  saveState: "idle" | "saving" | "success" | "error";
  errorMessage: string | null;
  compact?: boolean;
};

function ProfileForm({
  nickname,
  onNicknameChange,
  onSubmit,
  canSubmit,
  saveState,
  errorMessage,
}: Omit<ProfileFormCardProps, "compact">) {
  const errorId = "nickname-error";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(event) => onNicknameChange(event.target.value)}
          placeholder="e.g. Alex from Engineering"
          maxLength={24}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? errorId : undefined}
          className="h-11 rounded-xl bg-input/50"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={!canSubmit || saveState === "saving"}
        className="rounded-full px-6"
      >
        {saveState === "saving"
          ? "Saving…"
          : saveState === "success"
            ? "Saved!"
            : "Save nickname"}
      </Button>
      {errorMessage && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

export function ProfileFormCard({
  nickname,
  onNicknameChange,
  onSubmit,
  canSubmit,
  saveState,
  errorMessage,
  compact = false,
}: ProfileFormCardProps) {
  const initial = nickname.trim().charAt(0).toUpperCase() || "?";

  if (compact) {
    return (
      <Card className="border-border/60 bg-card/80 shadow-lg shadow-black/20">
        <CardContent className="pt-6">
          <ProfileForm
            nickname={nickname}
            onNicknameChange={onNicknameChange}
            onSubmit={onSubmit}
            canSubmit={canSubmit}
            saveState={saveState}
            errorMessage={errorMessage}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <SectionCard className="overflow-hidden">
      <div className="mb-4 flex items-center gap-4 border-b border-border/60 pb-4">
        <div
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-full",
            "bg-primary/20 font-display text-2xl font-bold text-primary"
          )}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary/80">
            Profile
          </p>
          <h2 className="font-display text-2xl font-semibold">
            Choose your display name
          </h2>
          <p className="text-sm text-muted-foreground">
            This name appears on the daily leaderboard.
          </p>
        </div>
      </div>

      <ProfileForm
        nickname={nickname}
        onNicknameChange={onNicknameChange}
        onSubmit={onSubmit}
        canSubmit={canSubmit}
        saveState={saveState}
        errorMessage={errorMessage}
      />
    </SectionCard>
  );
}
