import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard heading', async () => {
  render(<App />);
  expect(
    await screen.findByText(/users can view projects, track progress, and fill new project details/i)
  ).toBeInTheDocument();
  expect(await screen.findByText(/last synced/i)).toBeInTheDocument();
});
