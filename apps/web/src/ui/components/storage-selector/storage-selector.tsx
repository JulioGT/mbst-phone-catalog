import { useId } from 'react';
import type { StorageOption } from '../../../domain/product';
import styles from './storage-selector.module.css';

export interface StorageSelectorProps {
  readonly legend: string;
  readonly options: readonly StorageOption[];
  readonly selected: StorageOption | undefined;
  readonly onSelect: (option: StorageOption) => void;
}

/**
 * Native radio buttons styled as segments: arrow keys move between options and
 * screen readers announce "selected", with no ARIA needed.
 */
export function StorageSelector({ legend, options, selected, onSelect }: StorageSelectorProps) {
  const name = useId();
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.capacity} className={styles.option}>
            <input
              type="radio"
              className={styles.input}
              name={name}
              value={option.capacity}
              checked={selected?.capacity === option.capacity}
              onChange={() => onSelect(option)}
            />
            <span className={styles.text}>{option.capacity}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
