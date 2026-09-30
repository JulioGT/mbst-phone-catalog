import { copy } from "../../../copy";
import type { ProductDetail, Specifications } from "../../../domain/product";
import styles from "./specifications-table.module.css";

type SpecificationKey = keyof Specifications;

/** Fixed row order, as in the designs. */
const SPEC_ROWS: readonly SpecificationKey[] = [
  "screen",
  "resolution",
  "processor",
  "mainCamera",
  "selfieCamera",
  "battery",
  "os",
  "screenRefreshRate",
];

export function SpecificationsTable({
  product,
}: {
  readonly product: ProductDetail;
}) {
  const labels = copy.detail.specificationLabels;
  const rows: readonly [string, string | undefined, string | undefined][] = [
    [labels.brand, product.brand, undefined],
    [labels.name, product.name, undefined],
    [labels.description, product.description, "es"],
    ...SPEC_ROWS.map((key): [string, string | undefined, undefined] => [
      labels[key],
      product.specs[key],
      undefined,
    ]),
  ];

  return (
    <section
      className={styles.section}
      aria-labelledby="specifications-heading"
    >
      <h2 id="specifications-heading" className={styles.heading}>
        {copy.detail.specificationsHeading}
      </h2>
      <table className={styles.table}>
        <tbody>
          {rows.map(([label, value, lang]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td lang={lang}>
                {value ?? (
                  <>
                    <span aria-hidden="true">—</span>
                    <span className="visually-hidden">
                      {copy.detail.notAvailable}
                    </span>
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
