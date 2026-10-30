/**
 * Клиент Web-сервиса «Проценка» (Favorit Parts).
 * Документация: https://lk.favorit-parts.ru/static/wsprice.pdf
 *
 * GET http://api.favorit-parts.ru/hs/hsprice/
 *   key       - ключ покупателя (обязательный)
 *   number    - номер детали (обязательный)
 *   brand     - производитель (необязательный)
 *   analogues - "on" + brand => в ответе аналоги
 *   info      - "on" => в ответе признак невозвратных позиций
 */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://api.favorit-parts.ru/hs/hsprice/'

export const DEFAULT_API_KEY = import.meta.env.VITE_FAVORIT_API_KEY || ''

const ERROR_MESSAGES = {
  'Invalid access key': 'Неверный ключ доступа. Проверьте ключ покупателя (key).',
  'Empty key!': 'Не указан ключ доступа (key).',
  'Empty number goods!': 'Не указан номер детали.',
  'Request quota exceeded!': 'Превышен лимит запросов к сервису. Попробуйте позже.',
}

export class ApiError extends Error {
  constructor(message, kind = 'api') {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
  }
}

const toNumber = (value) => {
  const n = Number(String(value ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const normalizeKey = (value) => String(value ?? '').trim().toUpperCase()

const isEmptyGood = (good) =>
  !good ||
  (!good.goodsID &&
    !good.brand &&
    !good.number &&
    !good.name &&
    !(Array.isArray(good.warehouses) && good.warehouses.length) &&
    !(Array.isArray(good.analogues) && good.analogues.length))

export function normalizeGood(raw, index = 0) {
  const warehouses = (Array.isArray(raw?.warehouses) ? raw.warehouses : [])
    .map((w) => ({
      id: String(w.id ?? ''),
      code: w.code || 'Без названия',
      own: Boolean(w.own),
      shipmentDate: w.shipmentDate || null,
      price: toNumber(w.price),
      stock: Math.max(0, Math.trunc(toNumber(w.stock))),
      notRefund: Boolean(w.notRefund),
    }))
    .sort((a, b) => a.price - b.price || b.stock - a.stock)

  const stock = warehouses.reduce((sum, w) => sum + w.stock, 0)
  const best = warehouses.find((w) => w.stock > 0) || warehouses[0] || null

  return {
    id: String(raw?.goodsID ?? `${raw?.brand || ''}|${raw?.number || ''}|${index}`),
    brand: String(raw?.brand || '').trim(),
    number: String(raw?.number || '').trim(),
    name: String(raw?.name || '').trim(),
    rate: Math.max(1, Math.trunc(toNumber(raw?.rate)) || 1),
    notRefund: Boolean(raw?.notRefund),
    count: Math.max(0, Math.trunc(toNumber(raw?.count))),
    stock: stock || Math.max(0, Math.trunc(toNumber(raw?.count))),
    price: best ? best.price : null,
    bestWarehouse: best ? best.code : '',
    shipmentDate: best ? best.shipmentDate : null,
    warehouses,
    key: `${normalizeKey(raw?.brand)}|${normalizeKey(raw?.number)}`,
  }
}

async function request(params, { signal } = {}) {
  const url = new URL(API_BASE)
  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(name, value)
    }
  })

  let response
  try {
    response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(
      'Не удалось связаться с сервисом Favorit Parts. Проверьте подключение к сети и повторите попытку.',
      'network',
    )
  }

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new ApiError(
      `Сервис вернул неожиданный ответ (HTTP ${response.status}). Попробуйте позже.`,
      'parse',
    )
  }

  if (data && data.error) {
    const raw = String(data.error)
    throw new ApiError(ERROR_MESSAGES[raw.trim()] || `Ошибка сервиса: ${raw}`, 'api')
  }

  if (!response.ok) {
    throw new ApiError(`Сервис ответил ошибкой HTTP ${response.status}.`, 'http')
  }

  return data
}

export async function fetchBrands({ key, number, signal }) {
  const data = await request({ key, number, info: 'on' }, { signal })
  const goods = (Array.isArray(data?.goods) ? data.goods : []).filter((g) => !isEmptyGood(g))
  const seen = new Set()

  return goods.map((good, index) => normalizeGood(good, index)).filter((item) => {
    const id = item.key === '|' ? item.id : item.key
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

export async function fetchOffers({ key, number, brand, signal }) {
  const data = await request(
    { key, number, brand, analogues: 'on', info: 'on' },
    { signal },
  )

  const goods = (Array.isArray(data?.goods) ? data.goods : []).filter((g) => !isEmptyGood(g))
  const positions = []

  let sequence = 0
  goods.forEach((good) => {
    positions.push(normalizeGood(good, sequence++))
    const analogues = (Array.isArray(good.analogues) ? good.analogues : []).filter(
      (a) => !isEmptyGood(a),
    )
    analogues.forEach((analogue) => positions.push(normalizeGood(analogue, sequence++)))
  })

  const seen = new Set()
  const requestedKey = `${normalizeKey(brand)}|${normalizeKey(number)}`

  return positions
    .filter((item) => {
      const id = item.key === '|' ? item.id : item.key
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
    .map((item) => ({ ...item, isRequested: item.key === requestedKey }))
    .sort(
      (a, b) =>
        Number(b.isRequested) - Number(a.isRequested) ||
        (a.price ?? Infinity) - (b.price ?? Infinity) ||
        a.brand.localeCompare(b.brand),
    )
}
