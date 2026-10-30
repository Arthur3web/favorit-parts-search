const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return priceFormatter.format(Number(value))
}

export function formatStock(value) {
  const stock = Number(value) || 0
  return `${stock} шт.`
}

export function formatShipment(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const day = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(date)
  const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date)
  return `${day}, до ${time}`
}
