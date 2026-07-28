import React from 'react';

export function BrandLogo({ className = "w-7 h-7", glow = false, alt = "Trakcurr Logo" }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${glow ? 'group' : ''}`}>
      {glow && (
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-orange-500/20 rounded-xl blur-sm group-hover:opacity-100 transition-opacity duration-300 opacity-70" />
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        fill="currentColor"
        className={`relative z-10 transition-transform duration-200 ${className}`}
        aria-label={alt}
      >
        {/* T Top Bar (Left Frame) with Inner Cutout */}
        <path fillRule="evenodd" d="
          M 120 140 
          H 310 
          V 225 
          H 120 
          Z 
          M 145 165 
          H 285 
          V 200 
          H 145 
          Z
        "/>

        {/* T Right Stem */}
        <path fillRule="evenodd" d="
          M 310 140 
          H 395 
          V 250 
          H 345 
          V 290 
          H 310 
          Z 
          M 335 165 
          H 370 
          V 225 
          H 335 
          Z
        "/>

        {/* Arrowhead at Top Right */}
        <path d="
          M 395 85 
          V 145 
          L 360 125 
          L 330 85 
          Z
        "/>

        {/* Arrow Shaft */}
        <path d="
          M 360 125 
          L 175 365 
          L 145 340 
          L 330 100 
          Z
        "/>

        {/* 3D Isometric Block 1 (Bottom Left) */}
        <path fillRule="evenodd" d="
          M 165 385 
          H 215 
          V 455 
          H 165 
          Z 
          M 180 402 
          H 200 
          V 438 
          H 180 
          Z
        "/>
        <path fillRule="evenodd" d="
          M 215 385 
          H 265 
          V 455 
          H 215 
          Z 
          M 230 402 
          H 250 
          V 438 
          H 230 
          Z
        "/>

        {/* 3D Isometric Block 2 (Middle) */}
        <path fillRule="evenodd" d="
          M 210 335 
          H 260 
          V 405 
          H 210 
          Z 
          M 225 352 
          H 245 
          V 388 
          H 225 
          Z
        "/>
        <path fillRule="evenodd" d="
          M 260 335 
          H 310 
          V 405 
          H 260 
          Z 
          M 275 352 
          H 295 
          V 388 
          H 275 
          Z
        "/>

        {/* 3D Isometric Block 3 (Top Step) */}
        <path fillRule="evenodd" d="
          M 255 285 
          H 305 
          V 355 
          H 255 
          Z 
          M 270 302 
          H 290 
          V 338 
          H 270 
          Z
        "/>
        <path fillRule="evenodd" d="
          M 305 285 
          H 355 
          V 355 
          H 305 
          Z 
          M 320 302 
          H 340 
          V 338 
          H 320 
          Z
        "/>
      </svg>
    </div>
  );
}

export default BrandLogo;
