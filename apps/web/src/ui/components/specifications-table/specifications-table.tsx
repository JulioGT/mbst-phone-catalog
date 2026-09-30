import { copy } from '../../../copy';
import type { ProductDetail, Specifications } from '../../../domain/product';
import styles from './specifications-table.module.css';

type SpecificationKey = keyof Specifications;

/** Fixed row order, as in the designs. */
const SPEC_ROWS: readonly SpecificationKey[] = [
  'screen',
  'resolution',
  'processor',
  'mainCamera',
  'selfieCamera',
  'battery',
  'os',
  'screenRefreshRate',
];

export function SpecificationsTable({ product }: { readonly product: ProductDetail }) {
  const labels = copy.detail.specificationLabels;
  const rows: readonly [string, string | undefined][] = [
    [labels.brand, product.brand],
    [labels.name, product.name],
    [labels.description, product.description],
    ...SPEC_ROWS.map((key): [string, string | undefined] => [labels[key], product.specs[key]]),
  ];

  return (
    <section className={styles.section} aria-labelledby="specifications-heading">
      <h2 id="specifications-heading" className={styles.heading}>
        {copy.detail.specificationsHeading}
      </h2>
      <table className={styles.table}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>
                {value ?? (
                  <>
                    <span aria-hidden="true">—</span>
                    <span className="visually-hidden">{copy.detail.notAvailable}</span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
