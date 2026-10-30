export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null

  return (
    <div
      className="alert alert-danger d-flex flex-column flex-sm-row align-items-sm-center gap-2"
      role="alert"
    >
      <div className="flex-grow-1">
        <strong>Не удалось получить данные.</strong> {message}
      </div>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  )
}
