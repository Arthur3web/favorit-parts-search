import { useState } from "react";

const KEY_ERROR = "Сначала сохраните ключ покупателя в настройках подключения.";

export default function SearchForm({
  value = "",
  loading,
  hasKey = false,
  onChange,
  onSubmit,
}) {
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!hasKey) {
      setError(KEY_ERROR);
      return;
    }
    const number = value.trim();
    if (!number) {
      setError("Введите артикул детали.");
      return;
    }
    setError("");
    onSubmit(number);
  };

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="card-body">
        <h2 className="card-title mb-1">
          <span className="step-badge">1</span>
          Поиск производителей
        </h2>
        <p className="section-lead">
          Введите номер (артикул) автозапчасти — сервис вернёт всех
          производителей, которые выпускают деталь с таким номером.
        </p>

        <div className="row g-2">
          <div className="col-12 col-md">
            <label className="form-label visually-hidden" htmlFor="part-number">
              Артикул
            </label>
            <input
              id="part-number"
              className={`form-control search-input ${error ? "is-invalid" : ""}`}
              placeholder="Например: 7160500039S"
              value={value}
              onChange={(event) => {
                onChange(event.target.value);
                if (error && error !== KEY_ERROR) setError("");
              }}
              autoComplete="off"
              spellCheck="false"
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "part-number-error" : undefined}
            />
            {error && (
              <div id="part-number-error" className="invalid-feedback" role="alert">
                {error}
              </div>
            )}
          </div>
          <div className="col-12 col-md-auto">
            <button type="submit" className="btn btn-primary btn-lg search-submit w-100" disabled={loading}>
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                  Поиск…
                </>
              ) : (
                "Найти"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
