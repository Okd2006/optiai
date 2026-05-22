import React from 'react';

// Cursor Logo - Glassmorphic emerald pointer with glowing trail
export const CursorLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cursorGradient" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <filter id="cursorShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#10B981" floodOpacity="0.4" />
      </filter>
    </defs>
    <path d="M4 4l6.8 15.2 2.5-6.5 6.5-2.5z" fill="url(#cursorGradient)" filter="url(#cursorShadow)" />
    <path d="M12 12l5.5 5.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="17.5" cy="17.5" r="1.2" fill="#22D3EE" />
  </svg>
);

// GitHub Copilot Logo - Cybernetic purple-to-indigo robot head
export const CopilotLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="copilotGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="50%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <filter id="copilotInner" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0.5" dy="1" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.3" />
      </filter>
    </defs>
    {/* Headset headband arc */}
    <path d="M5 12a7 7 0 0 1 14 0" stroke="url(#copilotGradient)" strokeWidth="2.5" strokeLinecap="round" />
    {/* Copilot main shield/helmet */}
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" fill="url(#copilotGradient)" filter="url(#copilotInner)" />
    {/* Visor eyes */}
    <ellipse cx="9" cy="11.5" rx="1.2" ry="1.2" fill="#FFFFFF" />
    <ellipse cx="15" cy="11.5" rx="1.2" ry="1.2" fill="#FFFFFF" />
    <path d="M9.5 15c1 0.8 4 0.8 5 0" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// Claude Logo - Warm, architectural terracotta slab-serif 'A'
export const ClaudeLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="claudeGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="50%" stopColor="#EA580C" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
      <filter id="claudeShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0.5" dy="1" stdDeviation="0.5" floodColor="#7C2D12" floodOpacity="0.3" />
      </filter>
    </defs>
    {/* Layered brand monogram */}
    <path d="M18.88 20.35L14.28 9h-4.56l-4.6 11.35H2l7.76-17.7h4.48l7.76 17.7h-3.12z" fill="url(#claudeGradient)" filter="url(#claudeShadow)" />
    <path d="M13.14 16.71l-1.14-2.8h-1.6l-1.14 2.8h3.88z" fill="#FFF8F5" />
  </svg>
);

// OpenAI Logo - Iconic 3D spiral with multi-faceted cyan-to-emerald gradient
export const OpenAiLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="openaiGradient1" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0EA5E9" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="openaiGradient2" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0D9488" />
        <stop offset="100%" stopColor="#6EE7B7" />
      </linearGradient>
      <filter id="openaiShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#0D9488" floodOpacity="0.25" />
      </filter>
    </defs>
    <path d="M21.2 11.2a4.3 4.3 0 0 0-2.3-3.6 4.3 4.3 0 0 0 .5-4.2A4.3 4.3 0 0 0 15 1.5a4.3 4.3 0 0 0-3.6 2.3 4.3 4.3 0 0 0-4.2-.5A4.3 4.3 0 0 0 5 7.1a4.3 4.3 0 0 0-2.3 3.6 4.3 4.3 0 0 0 .5 4.2 4.3 4.3 0 0 0 4.4 2.1 4.3 4.3 0 0 0 3.6-2.3 4.3 4.3 0 0 0 4.2.5 4.3 4.3 0 0 0 2.2-3.8 4.3 4.3 0 0 0 2.3-3.6 4.3 4.3 0 0 0-.5-4.2zM12 14.5a2.5 2.5 0 1 1 2.5-2.5 2.5 2.5 0 0 1-2.5 2.5z" fill="url(#openaiGradient1)" filter="url(#openaiShadow)" />
    <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
  </svg>
);

// Gemini Logo - Google curved sparkle stars with dynamic blue-purple-pink glow
export const GeminiLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="geminiGradient1" x1="12" y1="2" x2="20" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
      <linearGradient id="geminiGradient2" x1="2" y1="12" x2="10" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#C084FC" />
      </linearGradient>
      <filter id="geminiShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Large primary sparkle */}
    <path d="M12.5 3c0 5-2 7-7 7 5 0 7 2 7 7 0-5 2-7 7-7-5 0-7-2-7-7z" fill="url(#geminiGradient1)" filter="url(#geminiShadow)" />
    {/* Secondary sparkle */}
    <path d="M6.5 14c0 3-1 4-4 4 3 0 4 1 4 4 0-3 1-4 4-4-3 0-4-1-4-4z" fill="url(#geminiGradient2)" />
    {/* Stellar core glow */}
    <circle cx="12.5" cy="10" r="0.8" fill="#FFFFFF" />
  </svg>
);

// Windsurf Logo - Wave sailing geometry with cyan-to-blue gradient
export const WindsurfLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="windsurfGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>
    {/* Waves and sail layered */}
    <path d="M10 2L3 17h14L10 2z" fill="url(#windsurfGradient)" fillOpacity="0.3" />
    <path d="M2 21c4-2 8-2 12 0s8 2 12 0" stroke="url(#windsurfGradient)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M10 3.5v12.5H4L10 3.5z" fill="#FFFFFF" fillOpacity="0.9" />
    <path d="M11 5.5v10.5h4L11 5.5z" fill="url(#windsurfGradient)" />
  </svg>
);

// Modular Logo Config Type
export interface BrandLogoConfig {
  logo: (props?: { className?: string }) => React.ReactNode;
  color: string;
  bgGlow: string;
}

// Centrally Exported Registry for visual tools mapping
export const TOOL_LOGOS: Record<string, BrandLogoConfig> = {
  cursor: { logo: (props) => <CursorLogo {...props} />, color: 'text-emerald-400 border-emerald-500/40', bgGlow: 'bg-emerald-500/10' },
  copilot: { logo: (props) => <CopilotLogo {...props} />, color: 'text-violet-400 border-violet-500/40', bgGlow: 'bg-violet-500/10' },
  claude: { logo: (props) => <ClaudeLogo {...props} />, color: 'text-amber-500 border-amber-500/40', bgGlow: 'bg-amber-500/10' },
  chatgpt: { logo: (props) => <OpenAiLogo {...props} />, color: 'text-teal-400 border-teal-500/40', bgGlow: 'bg-teal-500/10' },
  gemini: { logo: (props) => <GeminiLogo {...props} />, color: 'text-blue-400 border-blue-500/40', bgGlow: 'bg-blue-500/10' },
  windsurf: { logo: (props) => <WindsurfLogo {...props} />, color: 'text-cyan-400 border-cyan-500/40', bgGlow: 'bg-cyan-500/10' },
  openai_api: { logo: (props) => <OpenAiLogo {...props} />, color: 'text-teal-500 border-teal-600/40', bgGlow: 'bg-teal-600/10' },
  anthropic_api: { logo: (props) => <ClaudeLogo {...props} />, color: 'text-orange-400 border-orange-500/40', bgGlow: 'bg-orange-500/10' }
};

// OptiAI Logo — "Precision Loop" infinity-to-arrow custom branding
export const OptiAiLogo = ({ className = "w-12 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="optiAiSilver" x1="0" y1="0" x2="120" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="25%" stopColor="#CBD5E1" />
        <stop offset="50%" stopColor="#94A3B8" />
        <stop offset="75%" stopColor="#475569" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
      
      <linearGradient id="optiAiNeon" x1="16" y1="26" x2="112" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" /> {/* Vibrant Green */}
        <stop offset="40%" stopColor="#10B981" />
        <stop offset="70%" stopColor="#06B6D4" /> {/* Electric Cyan */}
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>

      <filter id="optiAiGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Glowing Background Glow effect */}
    <path 
      d="M 48,26 C 35,14 20,14 16,26 C 12,38 27,38 48,26 C 69,38 84,38 80,26 C 83,18 88,14 94,10 L 106,6" 
      stroke="url(#optiAiNeon)" 
      strokeWidth="9" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      opacity="0.3" 
      filter="url(#optiAiGlow)" 
    />

    {/* Right Top Loop (Underlying strand) */}
    {/* Silver Border */}
    <path 
      d="M 48,26 C 61,14 76,14 80,26 C 84,38 69,38 48,26" 
      stroke="url(#optiAiSilver)" 
      strokeWidth="7" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Neon Core */}
    <path 
      d="M 48,26 C 61,14 76,14 80,26 C 84,38 69,38 48,26" 
      stroke="url(#optiAiNeon)" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Left Loop + Right Bottom Loop + Arrow Shaft (Overlying strand) */}
    {/* Silver Border */}
    <path 
      d="M 48,26 C 35,14 20,14 16,26 C 12,38 27,38 48,26 C 69,38 84,38 80,26 C 83,18 88,14 94,10 L 106,6" 
      stroke="url(#optiAiSilver)" 
      strokeWidth="7" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Neon Core */}
    <path 
      d="M 48,26 C 35,14 20,14 16,26 C 12,38 27,38 48,26 C 69,38 84,38 80,26 C 83,18 88,14 94,10 L 106,6" 
      stroke="url(#optiAiNeon)" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Premium Stealthed Arrow Head */}
    {/* Silver Border */}
    <path 
      d="M 112,2 L 108,13 L 106,6 L 100,3 Z" 
      fill="url(#optiAiSilver)" 
      stroke="url(#optiAiSilver)" 
      strokeWidth="1.5" 
      strokeLinejoin="round" 
    />
    {/* Neon Core */}
    <path 
      d="M 112,2 L 108,13 L 106,6 L 100,3 Z" 
      fill="url(#optiAiNeon)" 
    />
  </svg>
);

