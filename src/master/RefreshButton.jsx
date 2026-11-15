export default function RefreshButton({ onClick, busy = false }) {
  return (
    <button
      type="button"
      className={`mc-refresh-btn${busy ? ' is-busy' : ''}`}
      onClick={onClick}
      disabled={busy}
      title="Refresh data"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 12a8 8 0 1 1-2.2-5.5M20 4v5h-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{busy ? 'Refreshing…' : 'Refresh'}</span>
    </button>
  );
}
