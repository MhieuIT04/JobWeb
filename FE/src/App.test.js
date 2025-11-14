import { render, screen } from '@testing-library/react';
<<<<<<< HEAD
import { test, expect } from 'jest';
=======
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
