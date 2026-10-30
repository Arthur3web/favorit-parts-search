import { Fragment, useState } from 'react'
import { formatPrice, formatShipment, formatStock } from '../utils/format'

function WarehouseList({ item }) {
  if (!item.warehouses.length) {
    return <div className="warehouse-list">Нет данных о складах.</div>
  }

  return (
    <div className="warehouse-list">
      {item.warehouses.map((warehouse) => (
        <div className="warehouse" key={`${warehouse.id}-${warehouse.code}-${warehouse.price}`}>
          <div className="warehouse__main">
            <span className="warehouse__code">{warehouse.code}</span>
            <span className={`pill ${warehouse.own ? 'pill--in' : 'pill--muted'}`}>
              {warehouse.own ? 'наш склад' : 'партнёр'}
            </span>
            {warehouse.notRefund && <span className="pill pill--warn">без возврата</span>}
          </div>
          <div className="warehouse__data">
            <span className="warehouse__price">{formatPrice(warehouse.price)}</span>
            <span className="warehouse__stock">
              {warehouse.stock > 0 ? formatStock(warehouse.stock) : 'нет в наличии'}
            </span>
            <span className="warehouse__ship">{formatShipment(warehouse.shipmentDate)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function OffersTable({ items }) {
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="table-responsive offers-table-wrap">
      <table className="table offers-table mb-0">
        <thead>
          <tr>
            <th className="cell-brand">Название / производитель</th>
            <th className="cell-number">Артикул</th>
            <th className="cell-price text-end">Цена</th>
            <th className="cell-stock">Остаток</th>
            <th className="cell-action">Склады</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isExpanded = expandedId === item.id
            const hasStock = item.stock > 0

            return (
              <Fragment key={item.id}>
                <tr className={`offer-row ${item.isRequested ? 'is-requested' : ''}`}>
                  <td className="cell-main cell-brand">
                    <span className="offer-brand">{item.brand || 'Без бренда'}</span>
                    {item.name && <span className="offer-name">{item.name}</span>}
                    {(item.isRequested || item.notRefund) && (
                      <span className="offer-badges">
                        {item.isRequested && <span className="pill pill--info">ваш выбор</span>}
                        {item.notRefund && <span className="pill pill--warn">без возврата</span>}
                      </span>
                    )}
                  </td>
                  <td data-label="Артикул" className="cell-number">
                    <span className="mono">{item.number}</span>
                  </td>
                  <td data-label="Стоимость" className="cell-price">
                    <span className="offer-price">{formatPrice(item.price)}</span>
                  </td>
                  <td data-label="Остаток" className="cell-stock">
                    <span className={`offer-stock ${hasStock ? 'text-success' : 'text-danger'}`}>
                      {hasStock ? formatStock(item.stock) : 'под заказ'}
                    </span>
                  </td>
                  <td className="cell-action">
                    {item.warehouses.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary offer-details-btn"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        aria-expanded={isExpanded}
                      >
                        <span>Склады&nbsp;({item.warehouses.length})</span>{' '}
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="offer-details">
                    <td colSpan={5}>
                      <WarehouseList item={item} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
