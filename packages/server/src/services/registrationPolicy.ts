export function getRegistrationBlockedReason(): string | null {
  if (process.env.RAFT_DISABLE_REGISTRATION === "true") {
    return "New account registration is disabled on this private instance.";
  }
  return null;
}

export function isRegistrationEnabled(): boolean {
  return getRegistrationBlockedReason() === null;
}

export function assertRegistrationEnabled(): void {
  const blockedReason = getRegistrationBlockedReason();
  if (blockedReason) {
    throw new Error(blockedReason);
  }
}
