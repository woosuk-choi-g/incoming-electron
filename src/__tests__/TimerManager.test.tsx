import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimerManager from '../components/TimerManager';

describe('TimerManager', () => {
  it('renders initial timers list', () => {
    render(<TimerManager />);

    expect(
      screen.getByRole('heading', { name: '오버레이 타이머 관리' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: '타이머 제거' })
    ).toHaveLength(3);
  });

  it('adds a new timer when the add button is clicked', async () => {
    const user = userEvent.setup();
    render(<TimerManager />);

    await user.click(
      screen.getByRole('button', { name: '새 오버레이 타이머 추가' })
    );

    expect(
      await screen.findAllByRole('button', { name: '타이머 제거' })
    ).toHaveLength(4);
  });
});
