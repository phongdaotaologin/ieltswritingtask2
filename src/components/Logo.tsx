import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative w-10 h-10 shrink-0">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Orange Squares */}
          <rect x="0" y="30" width="28" height="28" rx="4" fill="#FABA17" />
          <rect x="0" y="62" width="28" height="28" rx="4" fill="#FABA17" />
          
          {/* Light Blue Shape (Tilted Trapezoid) */}
          <path
            d="M32 30H64L68 90H32V30Z"
            fill="#0FB3E9"
          />
          
          {/* Dark Blue Speech Bubble (Tilted with Tail) */}
          <path
            d="M72 30H100V90H88L85 100L78 90H72V30Z"
            fill="#134A85"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-brand-navy tracking-tighter leading-none text-xl lg:text-2xl">
            IELTS LOGIN
          </span>
          <span className="text-[9px] lg:text-[10px] font-black text-brand-orange uppercase tracking-[0.3em]">
            Viet Nam
          </span>
        </div>
      )}
    </div>
  );
}
