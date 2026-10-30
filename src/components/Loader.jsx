export default function Loader({ text = 'Загрузка…' }) {
  return (
    <div className="loader-box" role="status">
      <span className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />
      <span>{text}</span>
    </div>
  )
}
