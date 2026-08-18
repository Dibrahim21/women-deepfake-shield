import React from 'react';

interface ShieldLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({
  className = '',
  size = 28,
  showText = false,
  textClassName = 'text-slate-900 font-extrabold tracking-tight',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-xs"
      >
        {/* Shield background */}
        <path
          d="M50 3C22 3 6 12 6 12V58C6 88 50 112 50 112C50 112 94 88 94 58V12C94 12 78 3 50 3Z"
          fill="#0B132B"
          stroke="#1E293B"
          strokeWidth="3"
        />
        
        {/* Circuit lines on left side */}
        <path
          d="M18 42H30M30 42L38 34H44"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="42" r="3.5" fill="#38BDF8" />
        <circle cx="44" cy="34" r="3.5" fill="#38BDF8" />

        <path
          d="M16 56H32M32 56L42 66H48"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="56" r="3.5" fill="#38BDF8" />
        <circle cx="48" cy="66" r="3.5" fill="#38BDF8" />

        <path
          d="M20 72H34L40 78"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="72" r="3.5" fill="#38BDF8" />

        <path
          d="M22 28H34L42 20H48"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="28" r="3.5" fill="#38BDF8" />
        <circle cx="48" cy="20" r="3.5" fill="#38BDF8" />

        {/* Female profile silhouette contour with neural lines */}
        <path
          d="M50 20C58 20 66 26 68 35C69 39 67 43 72 47C75 49 76 52 74 55C72 57 68 57 69 61C70 65 73 67 71 71C69 75 62 82 54 86C48 89 42 93 42 98"
          stroke="#38BDF8"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M34 94C38 88 44 82 48 74"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <div className={`flex flex-col leading-tight ${textClassName}`}>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Security System</span>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
            WOMEN DEEPFAKE SHIELD
          </span>
        </div>
      )}
    </div>
  );
};
