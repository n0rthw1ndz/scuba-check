import React from 'react';

export const ScubaLogo: React.FC = () => {
  return (
    <div className="flex items-center justify-center mb-6">
      <svg
        className="w-24 h-24 text-purple-light"
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Enhanced seaweed with leaves */}
        <path 
          d="M15 80 Q20 70 15 60 Q10 50 15 40 
             M12 75 Q15 73 13 70
             M18 65 Q15 63 17 60
             M12 55 Q15 53 13 50
             M18 45 Q15 43 17 40"
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none" 
          strokeOpacity="0.3"
        />
        <path 
          d="M85 80 Q80 65 85 50 Q90 35 85 20
             M82 75 Q85 73 83 70
             M88 65 Q85 63 87 60
             M82 55 Q85 53 83 50
             M88 45 Q85 43 87 40
             M82 35 Q85 33 83 30
             M88 25 Q85 23 87 20"
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none" 
          strokeOpacity="0.3"
        />

        {/* Small fish */}
        <path 
          d="M75 25 L80 28 L75 31 Z" 
          fill="currentColor" 
          fillOpacity="0.3"
        />
        <path 
          d="M20 70 L25 73 L20 76 Z" 
          fill="currentColor" 
          fillOpacity="0.3"
        />

        {/* Magnifying glass handle */}
        <path 
          d="M65 65 L80 80" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeLinecap="round"
        />
        
        {/* Magnifying glass rim */}
        <circle 
          cx="45" 
          cy="45" 
          r="25" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="6"
        />
        
        {/* Fish inside magnifying glass */}
        <g transform="translate(35, 35)">
          {/* Fish body */}
          <path
            d="M0 10 C10 0 20 0 25 10 C20 20 10 20 0 10"
            fill="currentColor"
            fillOpacity="0.6"
          />
          {/* Fish tail */}
          <path
            d="M-2 10 L-7 5 L-7 15 Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          {/* Fish eye */}
          <circle
            cx="20"
            cy="10"
            r="2"
            fill="#1e2132"
            fillOpacity="0.9"
          />
          {/* Fish fin */}
          <path
            d="M10 5 Q15 10 10 15"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            strokeOpacity="0.6"
          />
        </g>
        
        {/* Enhanced bubbles with animation */}
        <circle cx="25" cy="35" r="2" fillOpacity="0.8">
          <animate
            attributeName="cy"
            values="35;30;25;20;15"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fillOpacity"
            values="0.8;0.6;0.4;0.2;0"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="23" cy="30" r="1.5" fillOpacity="0.6">
          <animate
            attributeName="cy"
            values="30;25;20;15;10"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fillOpacity"
            values="0.6;0.5;0.4;0.2;0"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="21" cy="25" r="1" fillOpacity="0.4">
          <animate
            attributeName="cy"
            values="25;20;15;10;5"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fillOpacity"
            values="0.4;0.3;0.2;0.1;0"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Additional ambient bubbles */}
        <circle cx="70" cy="65" r="1" fillOpacity="0.3">
          <animate
            attributeName="cy"
            values="65;60;55;50;45"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="75" cy="70" r="1.2" fillOpacity="0.2">
          <animate
            attributeName="cy"
            values="70;65;60;55;50"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Reflection on magnifying glass */}
        <path 
          d="M25 25 L30 30" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
      </svg>
    </div>
  );
};