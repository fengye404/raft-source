# Fengye self-hosted deployment

This branch retains the upstream FSL-1.1-ALv2 license. It does not change the official Raft service or claim an official paid subscription.

Set `RAFT_SELF_HOSTED=true` on the **server** to enable local resource policy and replace the billing purchase panel with a self-hosted limits summary. Stripe checkout is disabled in this mode. Without this flag, upstream hosted behavior remains unchanged.

Limits are instance-wide environment variables. Restart the server after changing them. Each accepts a non-negative integer or `-1` (unlimited); omitted quota limits default to `-1`. Invalid values cause startup failure. Existing data is not deleted when a limit is reduced.

| Variable | Meaning | Default |
|---|---|---|
| RAFT_LIMIT_HISTORY_DAYS | Visible message history window, not a deletion policy | -1 |
| RAFT_LIMIT_MONTHLY_UPLOAD_BYTES | Monthly upload allowance, including reservations | -1 |
| RAFT_LIMIT_MEMBERS | Human membership capacity | -1 |
| RAFT_LIMIT_AGENTS | Agent capacity | -1 |
| RAFT_LIMIT_COMPUTERS | Computer capacity | -1 |
| RAFT_LIMIT_CHANNELS | Regular channel capacity | -1 |
| RAFT_LIMIT_GUEST_CHANNELS | Guest-joinable channel capacity | -1 |
| RAFT_LIMIT_SINGLE_UPLOAD_BYTES | Buffered attachment size ceiling | 52428800 |

Single-file uploads keep a 50 MiB default because the current transport buffers uploads. `-1` removes the application size ceiling but cannot remove reverse-proxy limits or memory constraints. Existing request rate limits, avatar size limits, authentication, channel permissions, and cross-server joint-channel policy remain separate. This is not a blanket bypass of every safety/transport limit.

`RAFT_DISABLE_REGISTRATION=true` separately closes account creation; existing users can log in. Preserve this setting for private instances.

Validation: targeted configuration/enforcement tests and frontend production build. Full server typechecking exceeded the initial Node heap on the small deployment host; do not represent that check as passing.
