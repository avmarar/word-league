export function getGameDocId(userId: string, dateKey: string) {
  return `${userId}_${dateKey}`;
}

export function getScoreDocId(dateKey: string, userId: string) {
  return `${dateKey}_${userId}`;
}

export function getProfilePath(userId: string) {
  const artifactsCollection =
    process.env.NEXT_PUBLIC_FIREBASE_ARTIFACTS_COLLECTION ?? "artifacts";
  const namespace = process.env.NEXT_PUBLIC_APP_NAMESPACE ?? "word-league";
  return `${artifactsCollection}/${namespace}/users/${userId}/data/profile`;
}
