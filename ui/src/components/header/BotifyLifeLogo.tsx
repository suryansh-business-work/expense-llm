// BotifyLifeLogo.tsx
import React from 'react';

interface BotifyLifeLogoProps {
  color?: string;
  height?: number | string;
  width?: number | string;
}

const BotifyLifeLogo: React.FC<BotifyLifeLogoProps> = ({
  color = "#3f51b5",
  height = 40,
  width = "auto"
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 100"
      height={height}
      width={width}
      fill={color}
    >
      {/* Bot Head */}
      <path d="M65 20c-13.8 0-25 11.2-25 25v30c0 13.8 11.2 25 25 25s25-11.2 25-25V45c0-13.8-11.2-25-25-25z"
        fillOpacity="0.9"
        stroke={color}
        strokeWidth="2"
      />

      {/* Bot Eyes */}
      <circle cx="55" cy="45" r="6" fill={color} />
      <circle cx="75" cy="45" r="6" fill={color} />

      {/* Bot Antenna */}
      <path d="M65 20v-10c0-3.3 2.7-6 6-6s6 2.7 6 6c0 3.3-2.7 6-6 6"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Bot Mouth */}
      <path d="M55 65h20"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Text: Botify Life */}
      <g transform="translate(105, 65)">
        {/* B */}
        <path d="M0,0 v-40 h15 c7,0 13,3 13,10 c0,5 -3,8 -7,9 c5,1 9,4 9,10 c0,7 -6,11 -13,11 z M10,-30 v7 h5 c2,0 4,-1 4,-3.5 c0,-2.5 -2,-3.5 -4,-3.5 z M10,-15 v9 h6 c3,0 5,-2 5,-4.5 c0,-2.5 -2,-4.5 -5,-4.5 z" />

        {/* o */}
        <path d="M40,-30 c-7,0 -13,5.5 -13,15 c0,9.5 6,15 13,15 c7,0 13,-5.5 13,-15 c0,-9.5 -6,-15 -13,-15 z M40,-8 c-3.5,0 -6,-3.5 -6,-7 c0,-3.5 2.5,-7 6,-7 c3.5,0 6,3.5 6,7 c0,3.5 -2.5,7 -6,7 z" />

        {/* t */}
        <path d="M65,-40 v10 h-5 v-10 z M65,-25 v25 h-10 v-25 h-5 v-5 h5 v-5 c0,-5 4,-10 10,-10 h5 v8 h-3 c-2,0 -2,1 -2,3 v4 h5 v5 z" />

        {/* i */}
        <path d="M75,-40 v10 h-10 v-10 z M75,-25 v25 h-10 v-25 z" />

        {/* f */}
        <path d="M95,-40 v10 h-10 v-10 z M95,-25 v5 h5 v5 h-5 v15 h-10 v-25 h-5 v-5 h5 v-5 c0,-5 4,-10 10,-10 h5 v8 h-3 c-2,0 -2,1 -2,3 v4 z" />

        {/* y */}
        <path d="M105,-25 h10 v16 c0,3 1,4 3,4 c2,0 3,-1 3,-4 v-16 h10 v18 c0,8 -5,12 -13,12 c-8,0 -13,-4 -13,-12 z" />

        {/* Space */}
        <path d="M140,0 z" />

        {/* L */}
        <path d="M150,0 v-40 h10 v32 h15 v8 z" />

        {/* i */}
        <path d="M185,-40 v10 h-10 v-10 z M185,-25 v25 h-10 v-25 z" />

        {/* f */}
        <path d="M205,-40 v10 h-10 v-10 z M205,-25 v5 h5 v5 h-5 v15 h-10 v-25 h-5 v-5 h5 v-5 c0,-5 4,-10 10,-10 h5 v8 h-3 c-2,0 -2,1 -2,3 v4 z" />

        {/* e */}
        <path d="M230,-30 c-7,0 -13,5.5 -13,15 c0,9.5 6,15 13,15 c5,0 9.5,-3 11,-8 h-10 v-7 h19 c0,15 -7,15 -20,15 c-8,0 -15,-5.5 -15,-15 c0,-9.5 7,-15 15,-15 c5,0 10,2 12,5 l-5,5 c-1.5,-2 -4,-3 -7,-3 z" />
      </g>
    </svg>
  );
};

export default BotifyLifeLogo;
