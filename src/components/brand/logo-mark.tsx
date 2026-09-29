import { FLAME_INNER_PATH, FLAME_OUTER_PATH, GEAR_PATH } from "./paths";

type Props = {
  className?: string;
  /** Unique prefix for gradient ids when several marks render on one page. */
  idPrefix?: string;
};

export function LogoMark({ className, idPrefix = "egf" }: Props) {
  const gearId = `${idPrefix}-gear`;
  const flameId = `${idPrefix}-flame`;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gearId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d24a3a" />
          <stop offset="1" stopColor="#a52a1e" />
        </linearGradient>
        <linearGradient id={flameId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#f25725" />
          <stop offset="1" stopColor="#f7b733" />
        </linearGradient>
      </defs>
      <path
        d={GEAR_PATH}
        fill={`url(#${gearId})`}
        stroke={`url(#${gearId})`}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.5" />
      <path d={FLAME_OUTER_PATH} fill={`url(#${flameId})`} />
      <path d={FLAME_INNER_PATH} fill="#ffe39a" fillOpacity="0.95" />
    </svg>
  );
}
