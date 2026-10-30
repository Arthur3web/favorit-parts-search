import { formatPrice, formatStock } from '../utils/format'

export default function BrandList({ items, number, onSelect }) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
          <h2 className="card-title mb-0">
            <span className="step-badge">2</span>
            Выбор производителя
          </h2>
          <span className="pill pill--muted">найдено: {items.length}</span>
        </div>
        <p className="section-lead">
          Артикул <span className="mono">{number}</span> — выберите производителя, чтобы получить
          аналоги и предложения складов.
        </p>

        <div className="brand-grid">
          {items.map((item) => (
            <button key={item.id} type="button" className="brand-card" onClick={() => onSelect(item.brand)}>
              <span className="brand-card__main">
                <span className="brand-card__brand">{item.brand || 'Без бренда'}</span>
                {item.name && <span className="brand-card__name">{item.name}</span>}
                <span className="brand-card__meta">
                  арт. <span className="mono">{item.number}</span>
                  {item.rate > 1 && ` · кратность ${item.rate}`}
                </span>
              </span>
              <span className="brand-card__aside">
                <span className="brand-card__price">{formatPrice(item.price)}</span>
                <span className={`pill ${item.stock > 0 ? 'pill--in' : 'pill--out'}`}>
                  {item.stock > 0 ? formatStock(item.stock) : 'нет в наличии'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
