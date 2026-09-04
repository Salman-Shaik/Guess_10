# Deca-Question Guesser

A same-device mystery-card party game for teams and individual players. Ask smart questions, reveal clues, and solve each card before your opponents.

## Development

```bash
npm install
npm start
```

## Verification

```bash
npm run test:coverage
npm run test:e2e
npm run build
```

The unit-test coverage threshold is enforced at 95% for statements, branches, functions, and lines. Playwright runs the primary game journeys on desktop and mobile Chromium.
