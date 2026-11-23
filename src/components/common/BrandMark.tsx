import React from 'react';

interface BrandMarkProps {
  onClick?: () => void;
  variant?: 'dark' | 'light';
}

export const BrandMark: React.FC<BrandMarkProps> = ({ onClick, variant = 'dark' }) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#141619]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 rounded-md ${textColor}`}
      aria-label="BuyHive Home"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M16 2.5L27.5 9.14V22.42L16 29.06L4.5 22.42V9.14L16 2.5Z"
          fill="#B45309"
        />
        <path
          d="M16 7.5L23.2 11.65V19.95L16 24.1L8.8 19.95V11.65L16 7.5Z"
          stroke="#FAF9F6"
          strokeWidth="2"
        />
        <circle cx="16" cy="15.8" r="2.6" fill="#FAF9F6" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight whitespace-nowrap">
        BuyHive
      </span>
    </button>
  );
};
