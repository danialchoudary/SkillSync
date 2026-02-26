import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import Toast from '../../src/components/Toast.jsx';

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when message is empty', () => {
    const { container } = render(<Toast message="" onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the provided message', () => {
    render(<Toast message="Profile updated" type="success" onClose={() => {}} />);
    expect(screen.getByText('Profile updated')).toBeInTheDocument();
  });

  it('calls onClose automatically after 5 seconds', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<Toast message="Saved" onClose={onClose} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when dismiss button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Dismiss me" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

