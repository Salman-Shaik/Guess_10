# Multiplayer room design

## Product rules

- A host creates and controls a room.
- Team mode supports 2–4 teams; the host names teams and assigns joining players.
- Individual mode supports 2–3 players.
- A six-character room code and shareable link let other devices join.
- Only the host can start, pause, skip, adjudicate answers, change settings, or end the game.
- Guests see only information allowed for their role. The secret card answer must never be sent to guessing clients.

## Recommended implementation

Use Supabase Postgres, anonymous authentication, and Realtime. It provides durable rooms, reconnection, presence, row-level access policies, and a server-side place to enforce host-only actions. Browser-only local storage or `BroadcastChannel` cannot support separate devices reliably.

### Data model

- `rooms`: `id`, `code`, `host_user_id`, `status`, `mode`, `settings`, timestamps.
- `participants`: `id`, `room_id`, `user_id`, `display_name`, `team_id`, `connected_at`.
- `teams`: `id`, `room_id`, `name`, `color`, `score`, `clues_remaining`, `turn_order`.
- `game_state`: `room_id`, `version`, `card_index`, `holder_team_id`, counters and privilege state.
- `room_events`: append-only action log for reconnects, debugging, and conflict resolution.

### Authority and synchronization

1. A guest joins with the room code and receives an anonymous user ID.
2. The host assigns the guest to a team or approves the individual player.
3. Every action calls a database function with the expected state version.
4. The function validates permissions and applies the transition atomically.
5. Realtime broadcasts the sanitized state to all clients.
6. On reconnect, clients load the current database snapshot rather than replaying local state.

### Security requirements

- Generate codes with cryptographically secure randomness and rate-limit join attempts.
- Store the active answer in a host-only table or return it only from a host-authorized function.
- Enforce host mutations with row-level security; hiding buttons in React is not authorization.
- Sanitize player/team names and cap lengths.
- Expire abandoned lobby rooms and rotate codes when a host recreates a room.

## Delivery sequence

1. Generalize the current two-team `GameState` into dynamic participant/team arrays.
2. Add Supabase environment configuration and migrations.
3. Implement create/join lobby, presence, team assignment, and host handoff.
4. Move all game transitions into tested pure functions shared by UI and server actions.
5. Add reconnect, kicked-player, duplicate-name, stale-action, and host-disconnect flows.
6. Run multi-browser and mobile-device end-to-end tests before enabling Online room.
