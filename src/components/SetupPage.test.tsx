import { fireEvent, render, screen } from '@testing-library/react';
import { SetupPage } from './SetupPage';

beforeEach(() => localStorage.clear());

test('configures a seven-player individual game', () => {
  const onStart = jest.fn();
  render(<SetupPage onStart={onStart} />);
  fireEvent.click(screen.getByRole('button', { name: 'Individuals' }));
  fireEvent.click(screen.getByRole('button', { name: '7' }));
  expect(screen.getByDisplayValue('Player 7')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Start game/i }));
  const config = onStart.mock.calls[0][0];
  expect(config.playMode).toBe('individuals');
  expect(config.match.participantOrder).toHaveLength(7);
  expect(Object.keys(config.match.teams)).toHaveLength(7);
});

test('supports four named teams with member metadata', () => {
  const onStart = jest.fn();
  render(<SetupPage onStart={onStart} />);
  fireEvent.click(screen.getByRole('button', { name: '4' }));
  expect(screen.getByDisplayValue('Team 4')).toBeInTheDocument();
  fireEvent.change(document.querySelector('#participant-4-members') as HTMLInputElement, { target: { value: 'Asha, Dev' } });
  fireEvent.click(screen.getByRole('button', { name: /Start game/i }));
  const config = onStart.mock.calls[0][0];
  expect(config.match.participantOrder).toHaveLength(4);
  expect(config.match.teams['participant-4'].members).toEqual(['Asha', 'Dev']);
});
