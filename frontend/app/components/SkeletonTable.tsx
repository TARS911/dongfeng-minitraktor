/**
 * SkeletonTable.tsx
 *
 * Skeleton loader для таблицы сравнения товаров.
 */

export default function SkeletonTable() {
  return (
    <div className="compare-table-wrapper">
      <table className="compare-table">
        <tbody>
          {/* Product Row */}
          <tr className="product-row">
            <td className="spec-name">Товар</td>
            {Array.from({ length: 4 }).map((_, i) => (
              <td key={i} className="product-cell">
                <div className="skeleton skeleton-image" style={{ height: "150px", marginBottom: "12px" }}></div>
                <div className="skeleton skeleton-text"></div>
              </td>
            ))}
          </tr>

          {/* Price Row */}
          <tr className="price-row">
            <td className="spec-name">Цена</td>
            {Array.from({ length: 4 }).map((_, i) => (
              <td key={i} className="product-cell">
                <div className="skeleton skeleton-text" style={{ width: "120px", height: "24px" }}></div>
              </td>
            ))}
          </tr>

          {/* Action Row */}
          <tr className="action-row">
            <td className="spec-name">Действие</td>
            {Array.from({ length: 4 }).map((_, i) => (
              <td key={i} className="product-cell">
                <div className="skeleton skeleton-text" style={{ width: "150px", height: "36px" }}></div>
              </td>
            ))}
          </tr>

          {/* Spec Rows */}
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="spec-name">
                <div className="skeleton skeleton-text" style={{ width: "100px" }}></div>
              </td>
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <td key={colIndex} className="product-cell">
                  <div className="skeleton skeleton-text"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
