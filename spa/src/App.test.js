import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.scrollTo = jest.fn();
});

test('renders the spa name', () => {
  render(<App />);
  const headings = screen.getAllByText(/lush nails spa/i);
  expect(headings.length).toBeGreaterThan(0);
});
