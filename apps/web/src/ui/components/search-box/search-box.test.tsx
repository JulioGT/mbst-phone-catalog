import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SEARCH_DEBOUNCE_MS, SearchBox } from './search-box';

function setup(value = '') {
  jest.useFakeTimers();
  const onSearch = jest.fn();
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const view = render(<SearchBox value={value} onSearch={onSearch} />);
  const input = screen.getByRole('searchbox', { name: 'Search for a smartphone' });
  return { ...view, onSearch, user, input };
}

afterEach(() => {
  jest.useRealTimers();
});

describe('SearchBox', () => {
  it('searches once typing pauses, not on every key', async () => {
    const { user, input, onSearch } = setup();

    await user.type(input, 'sams');
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 50));
    expect(onSearch).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(50));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('sams');
  });

  it('searches right away on Enter, with the term trimmed', async () => {
    const { user, input, onSearch } = setup();

    await user.type(input, '  pixel {Enter}');

    expect(onSearch).toHaveBeenCalledWith('pixel');
  });

  it('does not search again for the same term', async () => {
    const { user, input, onSearch } = setup('pixel');

    await user.type(input, ' ');
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('offers a named clear button only when there is text, which clears, searches and refocuses', async () => {
    const { user, input, onSearch } = setup();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();

    await user.type(input, 'oppo{Enter}');
    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(input).toHaveValue('');
    expect(onSearch).toHaveBeenLastCalledWith('');
    expect(input).toHaveFocus();
  });

  it('follows the committed value when it changes from outside (Back/Forward)', () => {
    const { rerender, input } = setup('samsung');

    rerender(<SearchBox value="apple" onSearch={jest.fn()} />);

    expect(input).toHaveValue('apple');
  });

  it('keeps what is being typed when its own earlier search is committed', async () => {
    const { user, input, onSearch, rerender } = setup();

    await user.type(input, 'sam');
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    await user.type(input, 'sung');
    rerender(<SearchBox value="sam" onSearch={onSearch} />);

    expect(input).toHaveValue('samsung');
  });

  it('is a search landmark with a labelled input and no accessibility violations', async () => {
    const { container, input } = setup('galaxy');
    jest.useRealTimers();

    // Testing Library does not map the <search> element to its role yet; browsers do.
    expect(container.querySelector('search')).toContainElement(input);
    expect(await axe(container)).toHaveNoViolations();
  });
});
