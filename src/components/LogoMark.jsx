// src/components/LogoMark.jsx
export default function LogoMark({ size = 28, title = "Camilo & Diego" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      style={{ display: "block" }}
    >
      <title>{title}</title>
      {/* Monograma CD */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      >
        {/* C */}
        <path
          d="M38 12
                   A20 20 0 1 0 38 52"
        />
        {/* D (media circunferencia + barra) */}
        <path d="M26 12 A20 20 0 0 1 26 52" />
        <line x1="32" y1="12" x2="32" y2="52" />
      </g>

      {/* Auto pequeño encima, centrado */}
      <g fill="currentColor" transform="translate(0,-2)">
        {/* carrocería */}
        <path d="M18 20 h28 a6 6 0 0 1 6 6 v3 H12 v-3 a6 6 0 0 1 6-6 z" />
        {/* techo */}
        <path
          d="M20 20
                   c4-6 20-6 24 0
                   z"
        />
        {/* ruedas */}
        <circle cx="20" cy="29" r="3" />
        <circle cx="44" cy="29" r="3" />
      </g>
    </svg>
  );
}
