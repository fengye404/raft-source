import { getEffectiveLimits, type ServerPlan } from "@botiverse/raft-shared";

export function isSelfHosted(): boolean {
  return process.env.RAFT_SELF_HOSTED === "true";
}

function limit(name: string, fallback = -1): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  if (!/^(?:-1|\d+)$/.test(raw)) throw new Error(`${name} must be -1 or a non-negative integer`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) throw new Error(`${name} exceeds the safe integer range`);
  return value;
}

export function getSelfHostedLimits() {
  return {
    messageHistoryDays: limit("RAFT_LIMIT_HISTORY_DAYS"),
    monthlyUploadBytes: limit("RAFT_LIMIT_MONTHLY_UPLOAD_BYTES"),
    maxHumans: limit("RAFT_LIMIT_MEMBERS"),
    maxAgents: limit("RAFT_LIMIT_AGENTS"),
    maxMachines: limit("RAFT_LIMIT_COMPUTERS"),
    maxChannels: limit("RAFT_LIMIT_CHANNELS"),
    maxGuestJoinableChannelsPerServer: limit("RAFT_LIMIT_GUEST_CHANNELS"),
    // Keep a bounded default for buffered uploads; 0 disables uploads.
    singleUploadBytes: limit("RAFT_LIMIT_SINGLE_UPLOAD_BYTES", 50 * 1024 * 1024),
  };
}

export function getRuntimePlanLimits(plan: ServerPlan, now?: Date) {
  return isSelfHosted()
    ? { ...getSelfHostedLimits(), includedAgents: -1 }
    : getEffectiveLimits(plan, now);
}

// Reject malformed limits during startup instead of silently widening access.
if (isSelfHosted()) getSelfHostedLimits();
