/**
 * SkeletonCard.tsx
 *
 * Skeleton loader для карточки товара.
 * Показывается во время загрузки данных из API.
 */

export default function SkeletonCard() {
  return (
    <div className="product-card">
      <div className="skeleton skeleton-image" style={{ height: "250px" }}></div>
      <div className="product-info" style={{ padding: "16px" }}>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text" style={{ width: "80%" }}></div>
        <div className="skeleton skeleton-text" style={{ width: "60%" }}></div>
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="skeleton skeleton-text" style={{ width: "100px", height: "24px" }}></div>
          <div className="skeleton skeleton-avatar"></div>
        </div>
      </div>
    </div>
  );
}
