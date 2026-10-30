import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ApiSettings from './components/ApiSettings'
import BrandList from './components/BrandList'
import ErrorAlert from './components/ErrorAlert'
import Loader from './components/Loader'
import OffersTable from './components/OffersTable'
import SearchForm from './components/SearchForm'
import {
  resetSearch,
  searchBrands,
  searchOffers,
  selectBrand,
  setKey,
  setNumber,
} from './store/searchSlice'
import { formatPrice } from './utils/format'

const SearchIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4-4" />
  </svg>
)

export default function App() {
  const dispatch = useDispatch()
  const {
    key,
    number,
    brands,
    brandsStatus,
    brandsError,
    selectedBrand,
    offers,
    offersStatus,
    offersError,
  } = useSelector((state) => state.search)

  const offersRef = useRef(null)
  const pendingRequest = useRef(null)

  const runSearch = useCallback(
    (thunkAction) => {
      pendingRequest.current?.abort()
      pendingRequest.current = dispatch(thunkAction)
    },
    [dispatch],
  )

  useEffect(() => () => pendingRequest.current?.abort(), [])

  const handleChangeNumber = useCallback(
    (value) => {
      dispatch(setNumber(value))
    },
    [dispatch],
  )

  const handleSearch = useCallback(
    (value) => {
      if (!value) return
      runSearch(searchBrands(value))
    },
    [runSearch],
  )

  const handleSelect = useCallback(
    (brand) => {
      if (!brand) return
      dispatch(selectBrand(brand))
      runSearch(searchOffers({ number, brand }))
    },
    [dispatch, number, runSearch],
  )

  const handleRetryOffers = useCallback(() => {
    if (!selectedBrand) return
    runSearch(searchOffers({ number, brand: selectedBrand }))
  }, [number, runSearch, selectedBrand])

  const handleBackToBrands = useCallback(() => {
    pendingRequest.current?.abort()
    dispatch(selectBrand(null))
  }, [dispatch])

  const handleReset = useCallback(() => {
    pendingRequest.current?.abort()
    dispatch(resetSearch())
  }, [dispatch])

  useEffect(() => {
    if (selectedBrand && offersRef.current) {
      offersRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedBrand, offersStatus])

  const offersInStock = offers.filter((item) => item.stock > 0).length
  const cheapest = offers.reduce(
    (min, item) => (item.stock > 0 && item.price !== null && item.price < min ? item.price : min),
    Infinity,
  )

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="app-header">
          <div className="app-logo">
            <SearchIcon />
          </div>
          <div className="app-header__text">
            <h1 className="app-title">Подбор автозапчастей</h1>
            <p className="app-subtitle">
              Проценка и аналоги по артикулу — Web-сервис «Проценка» Favorit Parts
            </p>
          </div>
        </header>

        <ApiSettings
          apiKey={key}
          onSaveKey={(value) => dispatch(setKey(value))}
        />

        <SearchForm
          value={number}
          loading={brandsStatus === 'loading'}
          hasKey={Boolean(key.trim())}
          onChange={handleChangeNumber}
          onSubmit={handleSearch}
        />

        {brandsStatus === 'loading' && (
          <div className="card mt-3">
            <Loader text="Запрашиваем производителей…" />
          </div>
        )}

        {brandsStatus === 'failed' && (
          <div className="mt-3">
            <ErrorAlert message={brandsError} onRetry={() => handleSearch(number)} />
          </div>
        )}

        {brandsStatus === 'succeeded' && brands.length === 0 && (
          <div className="alert alert-info mt-3 mb-0">
            <strong>Ничего не найдено.</strong> По артикулу «{number}» нет предложений. Проверьте
            написание номера или попробуйте другой артикул.
          </div>
        )}

        {brandsStatus === 'succeeded' && brands.length > 0 && (
          <div className="mt-3">
            <BrandList items={brands} number={number} onSelect={handleSelect} />
          </div>
        )}

        {selectedBrand && (
          <section className="card mt-3" ref={offersRef}>
            <div className="card-body pb-0">
              <div className="stage2-head">
                <div className="stage2-head__title">
                  <h2 className="card-title mb-1">Аналоги и предложения</h2>
                  <p className="section-lead mb-0">
                    Производитель <strong className="text-body">{selectedBrand}</strong> · артикул{' '}
                    <span className="mono">{number}</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleBackToBrands}
                >
                  ← Другой производитель
                </button>
              </div>

              {offersStatus === 'succeeded' && offers.length > 0 && (
                <div className="stat-row">
                  <div className="stat">
                    <div className="stat__label">Позиций</div>
                    <div className="stat__value">{offers.length}</div>
                  </div>
                  <div className="stat">
                    <div className="stat__label">В наличии</div>
                    <div className="stat__value">{offersInStock}</div>
                  </div>
                  <div className="stat">
                    <div className="stat__label">Мин. цена</div>
                    <div className="stat__value">
                      {Number.isFinite(cheapest) ? formatPrice(cheapest) : '—'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {offersStatus === 'loading' && <Loader text="Загружаем аналоги и предложения складов…" />}

            {offersStatus === 'failed' && (
              <div className="card-body pt-3">
                <ErrorAlert message={offersError} onRetry={handleRetryOffers} />
              </div>
            )}

            {offersStatus === 'succeeded' && offers.length === 0 && (
              <div className="card-body pt-3">
                <div className="alert alert-warning mb-0">
                  По этому производителю аналоги и предложения не найдены.
                </div>
              </div>
            )}

            {offersStatus === 'succeeded' && offers.length > 0 && (
              <OffersTable key={selectedBrand} items={offers} />
            )}
          </section>
        )}

        <footer className="app-footer">
          <span>
            {brandsStatus !== 'idle' || selectedBrand
              ? `Артикул: ${number || '—'}`
              : 'Готов к поиску'}
          </span>
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={handleReset}
          >
            Сбросить поиск
          </button>
        </footer>
      </div>
    </div>
  )
}
