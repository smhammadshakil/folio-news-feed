export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M6 5h13.2L26 11.8V27H6V5z" />
      <path className="folio-fold" d="M19.2 5v6.8H26L19.2 5z" />
      <path className="folio-rule" d="M9 14.2h10.4v1.7H9z" />
      <path className="folio-column" d="M9 18h8.6v1.25H9zm0 2.7h6.6v1.25H9zm0 2.7h7.8v1.25H9z" />
    </svg>
  );
}
