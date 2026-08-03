import type { FormEvent } from "react";

type ProfileFormCardProps = {
  nickname: string;
  onNicknameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  canSubmit: boolean;
  saveState: "idle" | "saving" | "success" | "error";
  errorMessage: string | null;
  compact?: boolean;
};

export function ProfileFormCard({
  nickname,
  onNicknameChange,
  onSubmit,
  canSubmit,
  saveState,
  errorMessage,
  compact = false,
}: ProfileFormCardProps) {
  return (
    <section className="rounded-3xl border border-white/5 bg-[#040a1c]/80 p-6 shadow-xl shadow-black/40">
      <form onSubmit={onSubmit} className="space-y-4">
        {!compact && (
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">
              Profile
            </p>
            <h2 className="text-2xl font-semibold text-white">
              Choose your display name
            </h2>
            <p className="text-sm text-white/60">
              This name appears on the daily leaderboard.
            </p>
          </div>
        )}
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Nickname *</span>
          <input
            type="text"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            placeholder="e.g. Alex from Engineering"
            maxLength={24}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          />
        </label>
        <button
          type="submit"
          disabled={!canSubmit || saveState === "saving"}
          className="btn-primary inline-flex items-center rounded-full bg-linear-to-r from-cyan-400 to-emerald-400 px-6 py-2 font-semibold outline-none transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveState === "saving"
            ? "Saving…"
            : saveState === "success"
              ? "Saved!"
              : "Save nickname"}
        </button>
        {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}
      </form>
    </section>
  );
}
