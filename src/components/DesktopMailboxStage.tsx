import React from 'react';

/**
 * Decorative pastel blossoms + leaves cluster for the SharingFlowScreen desktop header
 */
export const HeaderFlowerCluster: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 88 76"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    aria-hidden="true"
  >
    {/* Soft ground leaves */}
    <path d="M44 68C32 54 16 48 8 54C16 66 30 70 44 68Z" fill="#B8D99B" />
    <path d="M46 68C58 54 74 48 82 54C74 66 60 70 46 68Z" fill="#A5CD89" />
    <path d="M45 68C38 50 38 38 45 28C52 38 52 50 45 68Z" fill="#CCE5B3" />

    {/* Stems */}
    <path d="M31 66C29 52 27 42 26 32" stroke="#7AA86B" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M52 66C55 50 58 38 60 25" stroke="#7AA86B" strokeWidth="2.4" strokeLinecap="round" />

    {/* Left flower */}
    <g transform="translate(25, 29)">
      <circle cx="0" cy="-9" r="6.5" fill="#FFF3C8" stroke="#EBC374" strokeWidth="1.2" />
      <circle cx="8.5" cy="-2.8" r="6.5" fill="#FFF3C8" stroke="#EBC374" strokeWidth="1.2" />
      <circle cx="5.2" cy="7.2" r="6.5" fill="#FFF3C8" stroke="#EBC374" strokeWidth="1.2" />
      <circle cx="-5.2" cy="7.2" r="6.5" fill="#FFF3C8" stroke="#EBC374" strokeWidth="1.2" />
      <circle cx="-8.5" cy="-2.8" r="6.5" fill="#FFF3C8" stroke="#EBC374" strokeWidth="1.2" />
      <circle cx="0" cy="0" r="5" fill="#F6B856" />
    </g>

    {/* Right taller flower */}
    <g transform="translate(60, 22)">
      <circle cx="0" cy="-10" r="7" fill="#FFF5D4" stroke="#EBC374" strokeWidth="1.2" />
      <circle cx="9.5" cy="-3" r="7" fill="#FFF5D4" stroke="#EBC374" strokeWidth="1.2" />
      <circle cx="5.8" cy="8" r="7" fill="#FFF5D4" stroke="#EBC374" strokeWidth="1.2" />
      <circle cx="-5.8" cy="8" r="7" fill="#FFF5D4" stroke="#EBC374" strokeWidth="1.2" />
      <circle cx="-9.5" cy="-3" r="7" fill="#FFF5D4" stroke="#EBC374" strokeWidth="1.2" />
      <circle cx="0" cy="0" r="5.5" fill="#F5AE46" />
    </g>
  </svg>
);

/**
 * Full-width widescreen Cozy Garden cardboard mailbox stage for Desktop & Tablet (md+)
 * Reproduces the warm bedroom window, cardboard mailbox rim, pastel heart envelopes,
 * Sprout Mochi, and lush floral corners cleanly at any desktop aspect ratio.
 */
export const DesktopMailboxBackdrop: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
    <svg
      viewBox="0 0 1200 640"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="deskBoxWallTop" x1="600" y1="0" x2="600" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B87A4B" />
          <stop offset="100%" stopColor="#D79E6D" />
        </linearGradient>
        <linearGradient id="deskBoxWallLeft" x1="0" y1="320" x2="220" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B07346" />
          <stop offset="100%" stopColor="#CD9261" />
        </linearGradient>
        <linearGradient id="deskBoxWallRight" x1="1200" y1="320" x2="980" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#AF7144" />
          <stop offset="100%" stopColor="#CE9464" />
        </linearGradient>
        <linearGradient id="deskRoomWall" x1="600" y1="60" x2="600" y2="470" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5E0C2" />
          <stop offset="60%" stopColor="#F9EAD2" />
          <stop offset="100%" stopColor="#EDD3AF" />
        </linearGradient>
        <radialGradient id="deskLampGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(808 258) rotate(90) scale(190 230)">
          <stop offset="0%" stopColor="#FFF7D6" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#FFE1A8" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#FFE1A8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="deskNightSky" x1="250" y1="150" x2="250" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#264770" />
          <stop offset="100%" stopColor="#3B689B" />
        </linearGradient>
      </defs>

      {/* Outer cardboard interior base */}
      <rect width="1200" height="640" fill="#B5784B" />

      {/* Inner cozy bedroom opening */}
      <polygon points="180,95 1020,95 1130,360 980,480 220,480 70,360" fill="url(#deskRoomWall)" />

      {/* Warm lamp ambient glow */}
      <circle cx="808" cy="258" r="220" fill="url(#deskLampGlow)" />

      {/* Left Night Starry Window */}
      <g transform="translate(150, 145)">
        {/* Window outer frame */}
        <rect x="0" y="0" width="225" height="220" rx="14" fill="#AE764D" />
        <rect x="10" y="10" width="205" height="200" rx="8" fill="url(#deskNightSky)" />
        {/* Moon & stars */}
        <path d="M150 62C139 62 130 71 130 82C130 93 139 102 150 102C155 102 159 100 163 97C154 96 147 89 147 80C147 71 154 64 163 63C159 62 155 62 150 62Z" fill="#FFF2BA" />
        <circle cx="52" cy="48" r="2.2" fill="#FFF7D6" />
        <circle cx="88" cy="36" r="1.8" fill="#FFF7D6" />
        <circle cx="118" cy="54" r="2.5" fill="#FFF7D6" />
        <circle cx="66" cy="96" r="1.8" fill="#FFF7D6" />
        <circle cx="180" cy="44" r="2" fill="#FFF7D6" />
        <circle cx="186" cy="124" r="1.8" fill="#FFF7D6" />
        <circle cx="44" cy="142" r="2" fill="#FFF7D6" />
        {/* Soft distant clouds/trees silhouette */}
        <path d="M10 185C45 162 95 170 135 178C170 185 192 165 215 172V210H10V185Z" fill="#213E60" opacity="0.65" />
        {/* Window cross bars */}
        <rect x="108" y="8" width="9" height="204" fill="#B57E55" />
        <rect x="8" y="106" width="209" height="9" fill="#B57E55" />
        {/* Window sill */}
        <rect x="-12" y="212" width="249" height="16" rx="5" fill="#C4885B" />
        {/* Small potted plant on window sill */}
        <rect x="150" y="190" width="24" height="22" rx="4" fill="#C97D5D" />
        <ellipse cx="162" cy="184" rx="14" ry="10" fill="#77AA68" />
        <ellipse cx="154" cy="180" rx="8" ry="7" fill="#8EC07E" />
      </g>

      {/* Hanging vine leaves left */}
      <g opacity="0.88">
        <path d="M355 95C355 130 352 162 346 196" stroke="#75A562" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="348" cy="120" rx="10" ry="6" transform="rotate(-24 348 120)" fill="#89B972" />
        <ellipse cx="362" cy="138" rx="10" ry="6" transform="rotate(20 362 138)" fill="#A1CD89" />
        <ellipse cx="344" cy="162" rx="9" ry="5.5" transform="rotate(-18 344 162)" fill="#7EB167" />
        <ellipse cx="358" cy="182" rx="8.5" ry="5" transform="rotate(25 358 182)" fill="#96C37D" />
      </g>

      {/* Framed Heart Picture on bedroom wall */}
      <g transform="translate(432, 165)">
        <rect x="0" y="0" width="66" height="74" rx="8" fill="#D59A6C" />
        <rect x="8" y="8" width="50" height="58" rx="4" fill="#FFF7EB" />
        <path
          d="M33 29C29.5 23.5 22 24.5 20.5 30C18.5 36.5 25.5 42.5 33 48.5C40.5 42.5 47.5 36.5 45.5 30C44 24.5 36.5 23.5 33 29Z"
          fill="#EEA08A"
        />
      </g>

      {/* Right Wooden Shelf with Potted Plant & Books */}
      <g transform="translate(830, 145)">
        {/* Shelf plank */}
        <rect x="0" y="72" width="185" height="14" rx="5" fill="#B87E54" />
        <rect x="18" y="86" width="10" height="18" rx="3" fill="#9A643F" />
        <rect x="155" y="86" width="10" height="18" rx="3" fill="#9A643F" />
        {/* Potted trailing plant */}
        <rect x="16" y="42" width="34" height="30" rx="5" fill="#E8D8C2" />
        <ellipse cx="33" cy="36" rx="20" ry="12" fill="#7FB16B" />
        <ellipse cx="22" cy="30" rx="11" ry="9" fill="#98C782" />
        <ellipse cx="44" cy="31" rx="11" ry="8" fill="#89B973" />
        {/* Trailing vines from pot */}
        <path d="M18 48C10 66 8 92 14 114" stroke="#6E9D5C" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="10" cy="70" rx="7" ry="4.5" transform="rotate(-25 10 70)" fill="#88B971" />
        <ellipse cx="13" cy="96" rx="7" ry="4.5" transform="rotate(20 13 96)" fill="#9AC782" />
        {/* Stacked colorful cozy books */}
        <rect x="74" y="54" width="88" height="18" rx="5" fill="#70A79F" />
        <rect x="82" y="37" width="76" height="17" rx="5" fill="#8EC5BA" />
        <rect x="90" y="21" width="64" height="16" rx="5" fill="#DFAA81" />
      </g>

      {/* Cozy Bed & Nightstand on Right */}
      <g transform="translate(745, 228)">
        {/* Bed headboard */}
        <rect x="135" y="75" width="175" height="130" rx="18" fill="#BD8359" />
        {/* Pillows & cozy duvet */}
        <rect x="155" y="96" width="78" height="44" rx="16" fill="#FFF4E6" />
        <rect x="242" y="98" width="68" height="42" rx="16" fill="#FBE8D7" />
        <path d="M120 142C120 128 134 120 150 120H320V215H120V142Z" fill="#DF9C8D" />
        <path d="M120 132C148 124 185 128 215 135C245 142 290 130 320 134V162H120V132Z" fill="#FFF2E8" />
        {/* Nightstand */}
        <rect x="20" y="106" width="90" height="105" rx="10" fill="#BA8156" />
        <rect x="30" y="118" width="70" height="32" rx="6" fill="#CC9266" />
        <circle cx="65" cy="134" r="4" fill="#F3D6B3" />
        {/* Bedside Glowing Lamp */}
        <rect x="52" y="72" width="16" height="34" rx="4" fill="#C4895E" />
        <ellipse cx="60" cy="104" rx="20" ry="6" fill="#A96E45" />
        <path d="M32 72L42 32H78L88 72Z" fill="#FFF3C8" stroke="#E5B96B" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Small white ceramic pot on nightstand */}
        <rect x="92" y="82" width="22" height="24" rx="6" fill="#FFF7EB" />
        <ellipse cx="103" cy="76" rx="11" ry="8" fill="#81B46D" />
      </g>

      {/* Cardboard Box Perspective Inner Flaps & Framing */}
      {/* Top flap */}
      <polygon points="0,0 1200,0 1020,104 180,104" fill="url(#deskBoxWallTop)" />
      {/* Left inner wall */}
      <polygon points="0,0 180,104 180,400 0,468" fill="url(#deskBoxWallLeft)" />
      {/* Right inner wall */}
      <polygon points="1200,0 1020,104 1020,400 1200,468" fill="url(#deskBoxWallRight)" />
      {/* Subtle inner cardboard creases */}
      <path d="M180 104L1020 104" stroke="#9B6239" strokeWidth="3" opacity="0.55" />
      <path d="M180 104L180 400" stroke="#9B6239" strokeWidth="3" opacity="0.55" />
      <path d="M1020 104L1020 400" stroke="#9B6239" strokeWidth="3" opacity="0.55" />

      {/* Back cardboard tray edge behind envelopes */}
      <path d="M0 442L180 392H1020L1200 442V640H0V442Z" fill="#C48858" />
      <path d="M0 442L180 392H1020L1200 442" stroke="#9E653A" strokeWidth="3.5" fill="none" />

      {/* Pastel Envelopes tucked inside the cardboard mailbox */}
      {/* Far Left Peach Envelope */}
      <g transform="translate(362, 378) rotate(-18)">
        <rect x="0" y="0" width="150" height="104" rx="10" fill="#FBE6D7" stroke="#DDA58A" strokeWidth="2.5" />
        <path d="M4 6L75 62L146 6" stroke="#DDA58A" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M75 50C70 43 60 44 58 50C55 58 65 65 75 72C85 65 95 58 92 50C90 44 80 43 75 50Z" fill="#F49A9A" />
      </g>

      {/* Center-Left Cream Envelope */}
      <g transform="translate(476, 396) rotate(12)">
        <rect x="0" y="0" width="132" height="92" rx="10" fill="#FFF7DE" stroke="#E5B976" strokeWidth="2.5" />
        <path d="M4 6L66 54L128 6" stroke="#E5B976" strokeWidth="2.5" strokeLinejoin="round" />
      </g>

      {/* Center-Right Soft Silver/White Envelope */}
      <g transform="translate(612, 392) rotate(-11)">
        <rect x="0" y="0" width="142" height="96" rx="10" fill="#F3F7F5" stroke="#B6C6BF" strokeWidth="2.5" />
        <path d="M4 6L71 56L138 6" stroke="#B6C6BF" strokeWidth="2.5" strokeLinejoin="round" />
      </g>

      {/* Far Right Pastel Pink Envelope */}
      <g transform="translate(728, 360) rotate(15)">
        <rect x="0" y="0" width="160" height="108" rx="10" fill="#FAD2D7" stroke="#DF8F99" strokeWidth="2.5" />
        <path d="M4 6L80 64L156 6" stroke="#DF8F99" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M80 51C75 44 65 45 63 51C60 59 70 66 80 73C90 66 100 59 97 51C95 45 85 44 80 51Z" fill="#EF8592" />
      </g>

      {/* Center Mochi Body tucked inside the cardboard box */}
      <g transform="translate(600, 386)">
        {/* Two Sprout Leaves */}
        <path d="M0 -88V-108" stroke="#0C5D43" strokeWidth="5.5" strokeLinecap="round" />
        <path
          d="M0 -106C6 -136 42 -152 60 -138C62 -106 32 -96 0 -106Z"
          fill="#8FD07E"
          stroke="#0C5D43"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M-3 -104C-10 -132 -44 -144 -60 -130C-60 -98 -28 -94 -3 -104Z"
          fill="#B0E09A"
          stroke="#0C5D43"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Mochi Rounded Body */}
        <path
          d="M-96 22C-96 -52 -56 -90 0 -90C56 -90 96 -52 96 22C96 46 84 68 62 76H-62C-84 68 -96 46 -96 22Z"
          fill="#E8F9EE"
          stroke="#0C5D43"
          strokeWidth="5.5"
        />
        {/* Soft forehead highlight */}
        <ellipse cx="-38" cy="-42" rx="22" ry="10" transform="rotate(-22 -38 -42)" fill="#FFFFFF" opacity="0.82" />

        {/* Happy Curved Eyes ^_^ */}
        <path d="M-54 -4C-46 -18 -26 -18 -18 -4" stroke="#0C5D43" strokeWidth="6" strokeLinecap="round" />
        <path d="M18 -4C26 -18 46 -18 54 -4" stroke="#0C5D43" strokeWidth="6" strokeLinecap="round" />

        {/* Rosy Blushing Cheeks */}
        <ellipse cx="-58" cy="18" rx="16" ry="10" fill="#F9B0AE" opacity="0.85" />
        <ellipse cx="58" cy="18" rx="16" ry="10" fill="#F9B0AE" opacity="0.85" />

        {/* Sweet Smile */}
        <path d="M-12 16C-6 27 6 27 12 16" stroke="#0C5D43" strokeWidth="5" strokeLinecap="round" />

        {/* Motion tick lines near left side */}
        <line x1="-116" y1="24" x2="-128" y2="12" stroke="#F4D37B" strokeWidth="4" strokeLinecap="round" />
        <line x1="-122" y1="38" x2="-136" y2="32" stroke="#F4D37B" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Front cardboard box rim */}
      <rect x="0" y="456" width="1200" height="184" fill="#CC9262" />
      <path d="M0 456H1200" stroke="#9B633A" strokeWidth="4" />

      {/* Mochi Tiny Paws resting directly over the front rim */}
      <g transform="translate(600, 386)">
        <ellipse cx="-60" cy="68" rx="22" ry="16" fill="#E8F9EE" stroke="#0C5D43" strokeWidth="5" />
        <ellipse cx="60" cy="68" rx="22" ry="16" fill="#E8F9EE" stroke="#0C5D43" strokeWidth="5" />
      </g>

      {/* Bottom-Left Decorative Cozy Garden Leaves & Blossoms */}
      <g transform="translate(0, 320)">
        <ellipse cx="36" cy="270" rx="74" ry="52" fill="#82B66A" />
        <ellipse cx="96" cy="296" rx="76" ry="48" fill="#9BC87F" />
        <path d="M18 220C58 212 96 238 112 280C70 284 30 260 18 220Z" fill="#77AA60" />
        <path d="M98 164C122 184 128 222 108 250C80 232 76 190 98 164Z" fill="#8CBE72" />
        <path d="M148 210C188 210 218 240 216 280C178 278 148 248 148 210Z" fill="#A6D38A" />
        <path d="M222 252C258 242 292 264 298 302C260 308 228 286 222 252Z" fill="#95C479" />
        {/* White 5-petal flowers */}
        <g transform="translate(76, 178)">
          <circle cx="0" cy="-12" r="9" fill="#FFF9EE" />
          <circle cx="11" cy="-4" r="9" fill="#FFF9EE" />
          <circle cx="7" cy="9" r="9" fill="#FFF9EE" />
          <circle cx="-7" cy="9" r="9" fill="#FFF9EE" />
          <circle cx="-11" cy="-4" r="9" fill="#FFF9EE" />
          <circle cx="0" cy="0" r="6" fill="#F29F74" />
        </g>
        <g transform="translate(184, 286)">
          <circle cx="0" cy="-10" r="7.5" fill="#FFF9EE" />
          <circle cx="9.5" cy="-3" r="7.5" fill="#FFF9EE" />
          <circle cx="6" cy="8" r="7.5" fill="#FFF9EE" />
          <circle cx="-6" cy="8" r="7.5" fill="#FFF9EE" />
          <circle cx="-9.5" cy="-3" r="7.5" fill="#FFF9EE" />
          <circle cx="0" cy="0" r="5" fill="#F29F74" />
        </g>
      </g>

      {/* Bottom-Right Decorative Cozy Garden Leaves & Blossoms */}
      <g transform="translate(880, 320)">
        <ellipse cx="284" cy="274" rx="78" ry="54" fill="#82B66A" />
        <ellipse cx="212" cy="296" rx="80" ry="48" fill="#9BC87F" />
        <path d="M298 206C252 198 214 228 202 272C246 276 288 248 298 206Z" fill="#77AA60" />
        <path d="M214 144C186 168 182 210 206 242C236 222 240 176 214 144Z" fill="#8CBE72" />
        <path d="M158 204C116 206 86 238 90 278C128 276 158 244 158 204Z" fill="#A6D38A" />
        <path d="M84 252C48 244 16 268 12 304C50 310 80 286 84 252Z" fill="#95C479" />
        {/* White 5-petal flowers */}
        <g transform="translate(242, 168)">
          <circle cx="0" cy="-12" r="9" fill="#FFF9EE" />
          <circle cx="11" cy="-4" r="9" fill="#FFF9EE" />
          <circle cx="7" cy="9" r="9" fill="#FFF9EE" />
          <circle cx="-7" cy="9" r="9" fill="#FFF9EE" />
          <circle cx="-11" cy="-4" r="9" fill="#FFF9EE" />
          <circle cx="0" cy="0" r="6" fill="#F29F74" />
        </g>
        <g transform="translate(124, 282)">
          <circle cx="0" cy="-10" r="7.5" fill="#FFF9EE" />
          <circle cx="9.5" cy="-3" r="7.5" fill="#FFF9EE" />
          <circle cx="6" cy="8" r="7.5" fill="#FFF9EE" />
          <circle cx="-6" cy="8" r="7.5" fill="#FFF9EE" />
          <circle cx="-9.5" cy="-3" r="7.5" fill="#FFF9EE" />
          <circle cx="0" cy="0" r="5" fill="#F29F74" />
        </g>
      </g>
    </svg>
  </div>
);
