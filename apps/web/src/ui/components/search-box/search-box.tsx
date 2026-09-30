import { type FormEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import { copy } from '../../../copy';
import styles from './search-box.module.css';

export const SEARCH_DEBOUNCE_MS = 300;

export interface SearchBoxProps {
  /** The committed search term (from the URL). */
  readonly value: string;
  /** Called with the trimmed term once typing pauses, on Enter, or when cleared. */
  readonly onSearch: (searchTerm: string) => void;
}

/**
 * Search input with a debounced commit. The text being typed is local state;
 * only the committed term goes to the URL. When the URL changes from outside
 * (Back/Forward), the input follows it without losing what is being typed.
 */
export function SearchBox({ value, onSearch }: SearchBoxProps) {
  const [draft, setDraft] = useState(value);
  const lastCommitted = useRef(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  useEffect(() => {
    if (value !== lastCommitted.current) {
      lastCommitted.current = value;
      setDraft(value);
    }
  }, [value]);

  const commit = useCallback((term: string) => {
    const trimmed = term.trim();
    if (trimmed !== lastCommitted.current) {
      lastCommitted.current = trimmed;
      onSearchRef.current(trimmed);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => commit(draft), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, commit]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    commit(draft);
  }

  function handleClear() {
    setDraft('');
    commit('');
    inputRef.current?.focus();
  }

  return (
    <search>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="visually-hidden">
          {copy.list.searchLabel}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className={styles.input}
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder={copy.list.searchPlaceholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        {draft !== '' && (
          <button
            type="button"
            className={styles.clear}
            onClick={handleClear}
            aria-label={copy.list.clearSearch}
          >
            <svg aria-hidden="true" focusable="false" width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        )}
      </form>
    </search>
  );
}
