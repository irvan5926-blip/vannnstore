type Props = { size?: number; className?: string };

export default function Logo({ size = 40, className = "" }: Props) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="vsBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="vsLetter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1844" />
            <stop offset="100%" stopColor="#1745e0" />
          </linearGradient>
        </defs>
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill="url(#vsBg)"
          stroke="#0c1844"
          strokeWidth="2"
        />
        <path
          d="M14 16 L24 46 L32 46 L42 16"
          stroke="url(#vsLetter)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M44 36 c0 -5 4 -8 8 -8 s4 3 4 5 -2 4 -6 4 -6 1 -6 5 4 4 8 4"
          stroke="url(#vsLetter)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <div className="leading-tight">
        <div className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
          Vannn<span className="text-amber-300">Store</span>
        </div>
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-amber-200/80">
          Apps Premium Store
        </div>
      </div>
    </div>
  );
}
