import { afterEach, test, expect, vi } from "vitest";
import { getSelfHostedLimits, getRuntimePlanLimits, isSelfHosted } from "./selfHosted";

afterEach(() => vi.unstubAllEnvs());
test("hosted mode retains free history cutoff; self-host defaults unlimited", () => {
  vi.stubEnv("RAFT_SELF_HOSTED", "false");
  expect(isSelfHosted()).toBe(false);
  expect(getRuntimePlanLimits("free", new Date("2099-01-01")).messageHistoryDays).toBe(30);
  vi.stubEnv("RAFT_SELF_HOSTED", "true");
  expect(getRuntimePlanLimits("free").messageHistoryDays).toBe(-1);
  expect(getSelfHostedLimits().monthlyUploadBytes).toBe(-1);
  expect(getSelfHostedLimits().singleUploadBytes).toBe(52428800);
});
test("explicit zero, finite and unlimited settings remain distinct", () => {
  vi.stubEnv("RAFT_SELF_HOSTED", "true");
  vi.stubEnv("RAFT_LIMIT_AGENTS", "0");
  vi.stubEnv("RAFT_LIMIT_HISTORY_DAYS", "365");
  vi.stubEnv("RAFT_LIMIT_MONTHLY_UPLOAD_BYTES", "-1");
  expect(getRuntimePlanLimits("pro").maxAgents).toBe(0);
  expect(getRuntimePlanLimits("free").messageHistoryDays).toBe(365);
  expect(getSelfHostedLimits().monthlyUploadBytes).toBe(-1);
});
test.each(["-2", "NaN", "1.5", "1e3", "9007199254740992"])("reject invalid limit %s", value => {
  vi.stubEnv("RAFT_LIMIT_MEMBERS", value);
  expect(() => getSelfHostedLimits()).toThrow();
});

test("history and upload enforcement honor self-host settings", async () => {
  const { getHistoryCutoff } = await import("../services/planService");
  const { summarizeFileUploadQuota } = await import("../services/fileUploadQuotaService");
  vi.stubEnv("RAFT_SELF_HOSTED", "true");
  expect(getHistoryCutoff("free", new Date("2099-01-01"))).toBeUndefined();
  expect(summarizeFileUploadQuota("free", "2099-01", 200_000_000).enforced).toBe(false);
  vi.stubEnv("RAFT_LIMIT_HISTORY_DAYS", "10");
  vi.stubEnv("RAFT_LIMIT_MONTHLY_UPLOAD_BYTES", "100");
  expect(getHistoryCutoff("free", new Date("2099-01-11T12:00:00Z"))?.toISOString()).toBe("2099-01-01T12:00:00.000Z");
  expect(summarizeFileUploadQuota("free", "2099-01", 40, 10)).toMatchObject({ enforced: true, limitBytes: 100, remainingBytes: 50 });
  vi.stubEnv("RAFT_LIMIT_MONTHLY_UPLOAD_BYTES", "0");
  expect(summarizeFileUploadQuota("free", "2099-01", 0)).toMatchObject({ enforced: true, remainingBytes: 0 });
});
