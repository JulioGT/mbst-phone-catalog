import { type CSSProperties, useId } from 'react';
import type { ColorOption } from '../../../domain/product';
import styles from './color-selector.module.css';

export interface ColorSelectorProps {
  readonly legend: string;
  readonly options: readonly ColorOption[];
  readonly selected: ColorOption | undefined;
  readonly onSelect: (option: ColorOption) => void;
}

/**
 * Swatches as native radio buttons named after the color, so the choice is
 * never conveyed by color alone. The chosen name is also shown below, as in
 * the designs.
 */
export function ColorSelector({ legend, options, selected, onSelect }: ColorSelectorProps) {
  const name = useId();
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.name} className={styles.option} title={option.name}>
            <input
              type="radio"
              className={styles.input}
              name={name}
              value={option.name}
              aria-label={option.name}
              checked={selected?.name === option.name}
              onChange={() => onSelect(option)}
            />
            <span
              className={styles.swatch}
              style={{ '--swatch-color': option.hexCode } as CSSProperties}
            />
          </label>
        ))}
      </div>
      <p className={styles.chosen} aria-hidden="true">
        {selected?.name ?? ''}
      </p>
    </fieldset>
  );
}
