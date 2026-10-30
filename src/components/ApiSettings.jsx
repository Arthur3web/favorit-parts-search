import { useEffect, useRef, useState } from 'react'

export default function ApiSettings({ apiKey, onSaveKey }) {
  const [key, setKey] = useState(apiKey)
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef(null)
  const hasKey = Boolean(apiKey.trim())

  useEffect(() => () => window.clearTimeout(savedTimer.current), [])

  const handleSubmit = (event) => {
    event.preventDefault()
    onSaveKey(key.trim())
    setSaved(true)
    window.clearTimeout(savedTimer.current)
    savedTimer.current = window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <details className="card mb-3 api-settings" open={!hasKey}>
      <summary className="api-settings__summary">
        <span className="api-settings__title">
          <span className={`api-settings__dot ${hasKey ? '' : 'is-missing'}`} />
          <span className="api-settings__title-text">Настройки подключения</span>
        </span>
        <span className="api-settings__meta">
          <span className="api-settings__key d-none d-sm-inline">
            {hasKey ? 'ключ указан' : 'ключ не указан'}
          </span>
          <span className="api-settings__chev">▾</span>
        </span>
      </summary>
      <div className="card-body border-top">
        <p className={`api-settings__hint ${hasKey ? '' : 'api-settings__hint--required'}`}>
          {hasKey
            ? 'Ключ уже сохранён в этом браузере. При необходимости замените его.'
            : 'Чтобы начать поиск, укажите ключ покупателя (key) из личного кабинета Favorit Parts — раздел настроек Web-сервиса «Проценка».'}
        </p>
        <form onSubmit={handleSubmit}>
          <label className="form-label small mb-1" htmlFor="api-key">
            Ключ покупателя (key)
          </label>
          <div className="api-settings__field">
            <input
              id="api-key"
              className="form-control form-control-sm mono"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder="Вставьте ключ из личного кабинета"
              autoComplete="off"
              spellCheck="false"
              aria-describedby="api-key-hint"
            />
            <button type="submit" className="btn btn-sm btn-outline-secondary">
              {saved ? 'Сохранено ✓' : 'Сохранить'}
            </button>
          </div>
          <div id="api-key-hint" className="form-text mt-2">
            Ключ хранится только в этом браузере и отправляется только в Favorit Parts.
          </div>
        </form>
      </div>
    </details>
  )
}
