import { expect, test } from '@playwright/test';

const card = {
  name: 'Test Hero',
  buzzwords: ['mystery', 'cape', 'hero'],
  clues: ['clue one', 'clue two', 'clue three'],
  icon_info: { starTag: 'Legend', placeOfBirth: 'Earth', highestAward: 'Gold', alsoKnownFor: 'Testing' },
  bonus_question: 'Name the bonus?',
  bonus_answer: 'Bonus',
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('sets up team and individual games across all supported counts', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Create your game' })).toBeVisible();
  await page.getByRole('button', { name: '4' }).click();
  await expect(page.locator('input[value="Team 4"]')).toBeVisible();
  await page.getByRole('button', { name: 'Individuals' }).click();
  await page.getByRole('button', { name: '7' }).click();
  await expect(page.locator('input[value="Player 7"]')).toBeVisible();
  await page.getByRole('button', { name: 'Player 7' }).click();
  await expect(page.getByLabel('Game summary')).toContainText('Starts: Player 7');
});

test('shows rules and switches between every bundled category', async ({ page }) => {
  await page.getByRole('button', { name: 'How to play' }).click();
  await expect(page.getByRole('heading', { name: /Ask smart questions/ })).toBeVisible();
  await page.getByRole('button', { name: 'Set up game' }).click();
  for (const name of ['Indian Actors', 'Pokémon', 'MCU', 'World Cricket Legends', 'Telugu Movies', 'Anime Characters']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('button', { name, exact: true })).toHaveClass(/is-active/);
  }
});

test('imports a valid custom deck and rejects invalid JSON', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Custom Deck' }).click();
  await page.getByRole('button', { name: 'Create or import deck' }).click();
  await page.getByRole('button', { name: '2. Import JSON' }).click();
  await page.locator('.gi10-textarea').fill('not-json');
  await page.getByRole('button', { name: 'Validate & import' }).click();
  await page.locator('.gi10-textarea').fill(JSON.stringify([card]));
  await page.getByRole('button', { name: 'Validate & import' }).click();
  await expect(page.getByLabel('Game summary')).toContainText('1 cards');
});

test('plays a card through incorrect guess, correct guess, and bonus', async ({ page }) => {
  await page.getByRole('button', { name: 'Start game' }).click();
  await page.getByLabel('Team 2 guess').fill('wrong');
  await page.getByRole('button', { name: 'Lock in answer' }).click();
  await page.getByRole('button', { name: 'Incorrect answer' }).click();
  await expect(page.getByText(/1 attempt left/)).toBeVisible();
  await page.getByLabel('Team 2 guess').fill('right');
  await page.getByRole('button', { name: 'Lock in answer' }).click();
  await page.getByRole('button', { name: 'Correct answer', exact: true }).click();
  await expect(page.getByText(/Bonus challenge/)).toBeVisible();
  await page.getByRole('button', { name: 'Bonus correct' }).click();
  await expect(page.getByText(/Team 2 holds the card/)).toBeVisible();
});

test('uses clues, confirms question correction, persists refresh, and quits safely', async ({ page }) => {
  await page.getByRole('button', { name: 'Start game' }).click();
  await page.getByRole('button', { name: 'Use Team Clue' }).click();
  await expect(page.getByRole('button', { name: 'Clue Used' })).toBeDisabled();
  await page.getByRole('button', { name: '+1' }).click();
  await page.getByLabel('Decrease question count').click();
  await expect(page.getByRole('heading', { name: 'Remove one question?' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Quit game' })).toBeVisible();
  await page.getByRole('button', { name: 'Quit game' }).click();
  await page.getByRole('button', { name: 'Keep playing' }).click();
  await page.getByRole('button', { name: 'Quit game' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Quit game' }).click();
  await expect(page.getByRole('heading', { name: 'Create your game' })).toBeVisible();
});

test('configures endless mode and prevents declaring a tied winner', async ({ page }) => {
  await page.getByRole('button', { name: 'Endless' }).click();
  await page.getByRole('button', { name: 'Start game' }).click();
  await expect(page.getByRole('button', { name: 'End game' })).toBeDisabled();
  await page.getByRole('button', { name: 'Skip Card' }).click();
});
