export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
      <path fill="#d9d7d2" stroke="#1c1915" strokeWidth="1.25" d="M1.2 1.2H20.2L30.8 11.8V30.8H1.2Z" />
      <path stroke="#b7b4ae" strokeWidth="0.9" d="M5 18.6h22M5 22.6h19.5M5 26.6h16.5" />
      <path fill="#1c1915" d="M5 4h6.6v24H5z" />
      <path fill="#1c1915" d="M5 4h12.2l2.4 2.6V9.6H5z" />
      <path fill="#8f1d2c" d="M5 13.2h11.2V17.6H5z" />
    </svg>
  );
}
