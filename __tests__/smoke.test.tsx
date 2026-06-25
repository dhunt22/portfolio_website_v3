import { render, screen } from '@testing-library/react';

function Hello() {
  return <div>hello-jest</div>;
}

test('jest + RTL + jest-dom are wired up', () => {
  render(<Hello />);
  expect(screen.getByText('hello-jest')).toBeInTheDocument();
});
