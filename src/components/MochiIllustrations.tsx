import React from 'react';

/**
 * High-fidelity vector illustrations of Mochi and companion assets
 * Matches the Cozy Companion design system from the mockups
 */

/* 1. Mochi Landing Hero (Screen A) - Sprout Mochi with Heart Bubble and Sparkles */
export const MochiLandingHero: React.FC<{ className?: string }> = ({ className = 'w-56 h-48' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(40,92,61,0.08)]"
      >
        {/* Soft radial glow under Mochi */}
        <ellipse cx="120" cy="180" rx="75" ry="14" fill="var(--color-highlight)" opacity="0.65" />

        {/* Floating Heart Speech Bubble (top-left) */}
        <g className="animate-bounce" style={{ animationDuration: '3.2s' }}>
          {/* Bubble tail */}
          <path
            d="M62 68C60 76 52 82 46 84C54 84 62 82 66 76"
            fill="var(--color-surface)"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Bubble body */}
          <rect
            x="34"
            y="36"
            width="42"
            height="34"
            rx="16"
            fill="var(--color-surface)"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
          />
          {/* Pink Heart inside bubble */}
          <path
            d="M55 47C53.2 44.5 49.5 44.8 48.3 47.2C46.8 50.2 50.2 53.5 55 57C59.8 53.5 63.2 50.2 61.7 47.2C60.5 44.8 56.8 44.5 55 47Z"
            fill="#F48A8A"
          />
        </g>

        {/* Golden & Green Sparkles around Mochi */}
        {/* Top-right sparkle */}
        <g transform="translate(178, 42)">
          <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="#F4B23E" />
        </g>
        {/* Left sparkle */}
        <g transform="translate(24, 102)">
          <path d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z" fill="var(--color-secondary)" />
        </g>
        {/* Right little tick sparkles */}
        <line x1="184" y1="56" x2="192" y2="52" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="190" y1="68" x2="198" y2="70" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" />

        {/* 2 Leaves Sprout on Head */}
        <g>
          {/* Stem */}
          <path d="M120 86V72" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" />
          {/* Right leaf */}
          <path
            d="M120 72C122 52 142 42 152 48C154 66 136 74 120 72Z"
            fill="#79C57F"
            stroke="var(--color-primary)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Left leaf */}
          <path
            d="M118 73C114 56 94 48 84 56C84 74 104 78 118 73Z"
            fill="#98D99C"
            stroke="var(--color-primary)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Mochi Body (Round and soft) */}
        <ellipse
          cx="120"
          cy="134"
          rx="66"
          ry="50"
          fill="var(--color-highlight)"
          stroke="var(--color-primary)"
          strokeWidth="4"
        />

        {/* Soft highlight on top forehead */}
        <ellipse
          cx="96"
          cy="108"
          rx="18"
          ry="8"
          fill="var(--color-surface)"
          opacity="0.75"
          transform="rotate(-20 96 108)"
        />

        {/* Eyes (Happy curved eyes ^_^) */}
        <path
          d="M94 133C97 127 105 127 108 133"
          stroke="var(--color-primary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M132 133C135 127 143 127 146 133"
          stroke="var(--color-primary)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Cute Blushing Cheeks */}
        <ellipse cx="84" cy="142" rx="9" ry="6" fill="#F8A7A7" opacity="0.85" />
        <ellipse cx="156" cy="142" rx="9" ry="6" fill="#F8A7A7" opacity="0.85" />

        {/* Sweet Smile */}
        <path
          d="M115 141C117 146 123 146 125 141"
          stroke="var(--color-primary)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Tiny front paws resting */}
        <ellipse
          cx="88"
          cy="174"
          rx="10"
          ry="7"
          fill="var(--color-highlight)"
          stroke="var(--color-primary)"
          strokeWidth="3"
        />
        <ellipse
          cx="152"
          cy="174"
          rx="10"
          ry="7"
          fill="var(--color-highlight)"
          stroke="var(--color-primary)"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
};

/* 2. Mochi Resting Banner (Screen B & Home Screen) */
interface MochiRestingBannerProps {
  showBooksAndCoffee?: boolean;
  className?: string;
}

export const MochiRestingBanner: React.FC<MochiRestingBannerProps> = ({
  showBooksAndCoffee = false,
  className = 'w-full h-44',
}) => {
  return (
    <div
      className={`relative w-full rounded-[22px] overflow-hidden select-none border border-[var(--color-border)] shadow-[0_4px_16px_rgba(40,92,61,0.04)] ${className}`}
      style={{
        background: 'linear-gradient(180deg, #FAF4E8 0%, #EBF4E3 100%)',
      }}
    >
      <svg
        viewBox="0 0 400 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Soft warm sun in background */}
        <circle cx="310" cy="45" r="28" fill="#FEE9C5" opacity="0.85" />

        {/* Gentle pastel clouds */}
        <g fill="var(--color-surface)" opacity="0.8">
          <ellipse cx="90" cy="50" rx="24" ry="12" />
          <ellipse cx="110" cy="46" rx="18" ry="10" />
          <ellipse cx="76" cy="52" rx="14" ry="8" />

          <ellipse cx="320" cy="58" rx="22" ry="11" />
          <ellipse cx="340" cy="54" rx="16" ry="9" />
        </g>

        {/* Rolling background hills */}
        <path
          d="M-20 130C40 100 140 110 200 125C260 140 340 105 420 120V180H-20V130Z"
          fill="#DCEBCE"
          opacity="0.7"
        />
        <path
          d="M-20 145C60 135 150 148 240 135C330 122 380 140 420 142V180H-20V145Z"
          fill="#CCE3BA"
        />

        {/* Decorative foliage / leafy bushes in background */}
        <g stroke="var(--color-primary)" strokeWidth="2.5" fill="#A8D69A">
          {/* Left bush */}
          <path d="M35 150C30 130 50 120 60 135C70 125 85 135 80 152" fill="#BCE0B0" />
          <path d="M48 140C45 125 58 115 66 128" fill="#A8D69A" />

          {/* Right bush */}
          <path d="M335 152C330 130 350 122 360 136C370 126 385 136 380 154" fill="#BCE0B0" />
          <path d="M348 142C345 126 358 116 366 129" fill="#A8D69A" />
        </g>

        {/* Little tufts of grass */}
        <g stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
          <path d="M55 165L52 158M57 165L62 159" />
          <path d="M330 166L328 160M332 166L336 161" />
        </g>

        {/* Left side: Stack of Books (if showBooksAndCoffee) */}
        {showBooksAndCoffee && (
          <g transform="translate(68, 126)">
            {/* Bottom Book (Peach/Coral) */}
            <rect
              x="0"
              y="16"
              width="68"
              height="14"
              rx="4"
              fill="#F59F89"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
            />
            <rect x="5" y="19" width="58" height="8" rx="2" fill="var(--color-surface)" opacity="0.6" />

            {/* Top Book (Green) */}
            <rect
              x="6"
              y="2"
              width="58"
              height="14"
              rx="4"
              fill="#82C892"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
            />
            <rect x="11" y="5" width="48" height="8" rx="2" fill="var(--color-surface)" opacity="0.6" />
          </g>
        )}

        {/* Center: Mochi resting peacefully */}
        <g transform="translate(200, 138)">
          {/* Ground shadow */}
          <ellipse cx="0" cy="18" rx="46" ry="10" fill="#B2D49F" opacity="0.6" />

          {/* Two Sprout Leaves on Head */}
          <g>
            <path d="M0 -34V-46" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
            <path
              d="M0 -46C2 -60 18 -68 26 -62C28 -48 14 -44 0 -46Z"
              fill="#74C27A"
              stroke="var(--color-primary)"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <path
              d="M-2 -45C-6 -58 -22 -64 -30 -58C-30 -44 -14 -42 -2 -45Z"
              fill="#94D798"
              stroke="var(--color-primary)"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
          </g>

          {/* Body: Lying resting down */}
          <ellipse
            cx="0"
            cy="0"
            rx="48"
            ry="34"
            fill="var(--color-highlight)"
            stroke="var(--color-primary)"
            strokeWidth="3.5"
          />

          {/* Highlight */}
          <ellipse
            cx="-16"
            cy="-16"
            rx="12"
            ry="6"
            fill="var(--color-surface)"
            opacity="0.75"
            transform="rotate(-15 -16 -16)"
          />

          {/* Sleeping / Peacefully closed eyes */}
          <path
            d="M-20 2C-17 -2 -11 -2 -8 2"
            stroke="var(--color-primary)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M8 2C11 -2 17 -2 20 2"
            stroke="var(--color-primary)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Blushing cheeks */}
          <ellipse cx="-26" cy="8" rx="7" ry="5" fill="#F8A7A7" opacity="0.85" />
          <ellipse cx="26" cy="8" rx="7" ry="5" fill="#F8A7A7" opacity="0.85" />

          {/* Tiny sweet smile */}
          <path
            d="M-4 9C-2 13 2 13 4 9"
            stroke="var(--color-primary)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Tiny paws resting in front */}
          <ellipse
            cx="-28"
            cy="24"
            rx="8"
            ry="6"
            fill="var(--color-highlight)"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
          />
          <ellipse
            cx="28"
            cy="24"
            rx="8"
            ry="6"
            fill="var(--color-highlight)"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
          />

          {/* Sparkles above head */}
          <path d="M-36 -28L-44 -34" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" />
          <path d="M-30 -36L-34 -44" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Right side: Steaming Mug with Heart (if showBooksAndCoffee) */}
        {showBooksAndCoffee && (
          <g transform="translate(270, 132)">
            {/* Steam lines */}
            <path
              d="M14 -8C12 -14 16 -18 14 -24"
              stroke="#B3CBB7"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M22 -6C20 -12 24 -16 22 -22"
              stroke="#B3CBB7"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Mug Body */}
            <rect
              x="4"
              y="6"
              width="30"
              height="30"
              rx="6"
              fill="var(--color-surface)"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
            />
            {/* Mug Handle */}
            <path
              d="M34 12C41 12 41 26 34 26"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Heart on Mug */}
            <path
              d="M19 18C17.5 16 14.5 16.2 13.5 18C12.3 20.5 15 23 19 26C23 23 25.7 20.5 24.5 18C23.5 16.2 20.5 16 19 18Z"
              fill="#F48A8A"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

/* 3. Mochi with Headphones (Screen C Relaxation Card & Home Screen Card) */
export const MochiHeadphones: React.FC<{ className?: string }> = ({ className = 'w-24 h-20' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Floating Musical Notes */}
        <g fill="var(--color-primary)" opacity="0.85">
          {/* Note 1 */}
          <path d="M102 24C102 22 104 20 107 20C110 20 111 22 111 24V32C111 34 109 35 107 35C105 35 103 34 103 32C103 30 105 29 107 29C108 29 109 30 109 30V23L104 24V30C104 31 103 31 102 31C101 31 100 30 100 29C100 28 101 27 102 27V24Z" />
          {/* Note 2 */}
          <circle cx="15" cy="30" r="3" />
          <path d="M18 30V18L26 16V28" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="23" cy="28" r="3" />
        </g>

        {/* Sprout on Head */}
        <g>
          <path d="M60 40V30" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M60 30C61 20 71 14 77 18C78 27 68 31 60 30Z"
            fill="#79C57F"
            stroke="var(--color-primary)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M59 31C56 22 46 18 41 22C41 31 51 33 59 31Z"
            fill="#98D99C"
            stroke="var(--color-primary)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </g>

        {/* Mochi Head */}
        <ellipse
          cx="60"
          cy="66"
          rx="36"
          ry="28"
          fill="var(--color-highlight)"
          stroke="var(--color-primary)"
          strokeWidth="3"
        />

        {/* Headphone Band */}
        <path
          d="M30 60C30 38 90 38 90 60"
          stroke="var(--color-secondary)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M30 60C30 38 90 38 90 60"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Ear Cups */}
        <rect
          x="22"
          y="52"
          width="12"
          height="22"
          rx="6"
          fill="var(--color-secondary)"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
        />
        <rect
          x="86"
          y="52"
          width="12"
          height="22"
          rx="6"
          fill="var(--color-secondary)"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
        />

        {/* Peaceful Smiling Eyes */}
        <path
          d="M48 66C50 62 54 62 56 66"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M64 66C66 62 70 62 72 66"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Blushing Cheeks */}
        <ellipse cx="42" cy="72" rx="5" ry="3.5" fill="#F8A7A7" opacity="0.85" />
        <ellipse cx="78" cy="72" rx="5" ry="3.5" fill="#F8A7A7" opacity="0.85" />

        {/* Smile */}
        <path
          d="M57 73C58 76 62 76 63 73"
          stroke="var(--color-primary)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

/* 4. Pink Journal Book (Home Screen) */
export const JournalPinkBook: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_8px_rgba(40,92,61,0.08)]"
      >
        {/* Sparkles */}
        <line x1="16" y1="28" x2="22" y2="24" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="36" x2="26" y2="34" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="78" y1="78" x2="84" y2="74" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Book rotated gently */}
        <g transform="rotate(-8 50 50)">
          {/* Back cover / shadow pages */}
          <rect
            x="24"
            y="20"
            width="56"
            height="64"
            rx="8"
            fill="#EAD2C6"
            stroke="var(--color-primary)"
            strokeWidth="3"
          />
          {/* Paper pages thickness */}
          <rect
            x="28"
            y="18"
            width="52"
            height="64"
            rx="8"
            fill="#FFF8F2"
            stroke="var(--color-primary)"
            strokeWidth="2"
          />

          {/* Front Cover (Pastel pink/peach) */}
          <rect
            x="22"
            y="16"
            width="56"
            height="64"
            rx="8"
            fill="#F6B8AF"
            stroke="var(--color-primary)"
            strokeWidth="3"
          />

          {/* Golden Ribbon Bookmark */}
          <path
            d="M52 74V88L58 84L64 88V74"
            fill="#F5C352"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Heart on cover */}
          <path
            d="M50 44C47.5 40 42 40.5 40.5 44C38.5 48.5 43.5 53 50 58C56.5 53 61.5 48.5 59.5 44C58 40.5 52.5 40 50 44Z"
            fill="var(--color-surface)"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
};

/* 5. MindCare Brand Logo (Leaf + Typo) */
export const MindCareBrandLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Green Leaf Icon */}
      <div className="shrink-0 text-[var(--color-primary)]">
        <svg
          width={size}
          height={size}
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 23C7 16 11 11 23 5C23 17 18 21 11 23C8 23 6 23 5 23Z"
            fill="var(--color-primary)"
          />
          <path
            d="M8 20C12 16 16 12 21 7"
            stroke="var(--color-surface)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="font-bold text-[var(--color-primary)] text-[20px] tracking-tight font-sans">
        MindCare
      </span>
    </div>
  );
};

/* 6. Mood Face Icon (4 Moods: Happy, Neutral, Stressed, Sad) */
export type MoodType = 'happy' | 'neutral' | 'stressed' | 'sad';

export const MoodFaceIcon: React.FC<{
  mood: MoodType;
  size?: number;
  className?: string;
}> = ({ mood, size = 18, className = '' }) => {
  if (mood === 'happy') {
    // Green Happy Smile
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="12" cy="12" r="11" fill="var(--color-highlight)" stroke="#2B6B44" strokeWidth="1.8" />
        {/* Smiling Eyes */}
        <circle cx="8" cy="9.5" r="1.5" fill="var(--color-primary)" />
        <circle cx="16" cy="9.5" r="1.5" fill="var(--color-primary)" />
        {/* Curved Smile */}
        <path
          d="M7.5 13.5C8.8 16.5 15.2 16.5 16.5 13.5"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (mood === 'neutral') {
    // Yellow Neutral Flat Mouth
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="12" cy="12" r="11" fill="#FFF0B5" stroke="#9A7700" strokeWidth="1.8" />
        {/* Neutral Eyes */}
        <circle cx="8" cy="9.5" r="1.5" fill="#806200" />
        <circle cx="16" cy="9.5" r="1.5" fill="#806200" />
        {/* Straight mouth */}
        <path d="M7.5 15H16.5" stroke="#806200" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (mood === 'stressed') {
    // Orange Stressed Furrowed Brows / Angled Eyes
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="12" cy="12" r="11" fill="#FFD7BD" stroke="#C35218" strokeWidth="1.8" />
        {/* Angled Eyes > < */}
        <path d="M6.5 8.5L9 10.5L6.5 12" stroke="#B24A12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.5 8.5L15 10.5L17.5 12" stroke="#B24A12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Wavy/frustrated mouth */}
        <path d="M8.5 16C10 14.5 11.5 17 13 15.5C14 14.5 15 15.5 15.5 15.5" stroke="#B24A12" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Blue-grey Sad with teardrop
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="11" fill="#DCE7F5" stroke="#375D8F" strokeWidth="1.8" />
      {/* Sad Eyes */}
      <circle cx="8" cy="10" r="1.5" fill="#2C4E7A" />
      <circle cx="16" cy="10" r="1.5" fill="#2C4E7A" />
      {/* Down-curved mouth */}
      <path
        d="M8 16C9.5 14 14.5 14 16 16"
        stroke="#2C4E7A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Tear drop on left cheek */}
      <path
        d="M6.5 11.5C6.5 11.5 5.5 13 5.5 13.8C5.5 14.5 6 15 6.8 15C7.5 15 8 14.5 8 13.8C8 13 6.5 11.5 6.5 11.5Z"
        fill="#3B82F6"
      />
    </svg>
  );
};

/* 7. Mochi Peeking Behind Calendar (Exact illustration from image_c489dd4f.png) */
export const MochiPeeking: React.FC<{ className?: string }> = ({ className = 'w-44 h-24' }) => {
  return (
    <div className={`relative flex items-end justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 160 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Soft green foliage behind Mochi */}
        <g opacity="0.8">
          <ellipse cx="44" cy="58" rx="20" ry="12" fill="#CCE6C4" />
          <ellipse cx="32" cy="62" rx="14" ry="10" fill="#B4DCAB" />
          <ellipse cx="118" cy="56" rx="22" ry="14" fill="#CCE6C4" />
          <ellipse cx="132" cy="60" rx="15" ry="10" fill="#B4DCAB" />
        </g>

        {/* Golden joy sparkles on right \ | / */}
        <g stroke="#F3B346" strokeWidth="2.5" strokeLinecap="round">
          <line x1="120" y1="28" x2="128" y2="24" />
          <line x1="124" y1="36" x2="134" y2="36" />
          <line x1="122" y1="44" x2="130" y2="48" />
        </g>

        {/* 2 Leaves Sprout on Mochi Head */}
        <g>
          <path d="M80 32V22" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
          {/* Right leaf */}
          <path
            d="M80 22C82 10 96 4 104 8C105 18 92 24 80 22Z"
            fill="#79C57F"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Left leaf */}
          <path
            d="M79 23C76 12 62 8 55 13C55 23 68 26 79 23Z"
            fill="#98D99C"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Mochi Head/Body emerging */}
        <path
          d="M40 76C40 48 58 32 80 32C102 32 120 48 120 76C120 78 119 80 118 82H42C41 80 40 78 40 76Z"
          fill="var(--color-highlight)"
          stroke="var(--color-primary)"
          strokeWidth="3"
        />

        {/* Soft highlight */}
        <ellipse cx="64" cy="46" rx="10" ry="5" fill="var(--color-surface)" opacity="0.75" transform="rotate(-15 64 46)" />

        {/* Eyes (happy curved ^_^) */}
        <path d="M64 56C66 52 70 52 72 56" stroke="var(--color-primary)" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M88 56C90 52 94 52 96 56" stroke="var(--color-primary)" strokeWidth="2.8" strokeLinecap="round" />

        {/* Rosy Cheeks */}
        <ellipse cx="56" cy="62" rx="6" ry="4" fill="#F8A7A7" opacity="0.85" />
        <ellipse cx="104" cy="62" rx="6" ry="4" fill="#F8A7A7" opacity="0.85" />

        {/* Sweet Smile */}
        <path d="M77 62C78 65 82 65 83 62" stroke="var(--color-primary)" strokeWidth="2.4" strokeLinecap="round" />

        {/* Tiny paws resting over the edge */}
        <ellipse cx="58" cy="80" rx="7" ry="5" fill="var(--color-highlight)" stroke="var(--color-primary)" strokeWidth="2.2" />
        <ellipse cx="102" cy="80" rx="7" ry="5" fill="var(--color-highlight)" stroke="var(--color-primary)" strokeWidth="2.2" />
      </svg>
    </div>
  );
};

/* 8. Mochi Resting Footer (Exact illustration from bottom of image_c489dd4f.png) */
export const MochiFooterResting: React.FC<{ className?: string }> = ({ className = 'w-32 h-18' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 130 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Soft grass mound and leaves around Mochi */}
        <path d="M4 64C20 48 60 52 126 62" stroke="#A6D89F" strokeWidth="5" strokeLinecap="round" />
        <g stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
          {/* Grass blades */}
          <path d="M18 58L12 48" />
          <path d="M22 58L22 46" />
          <path d="M26 60L32 50" />
          <path d="M104 60L108 48" />
          <path d="M110 62L116 52" />
        </g>
        <ellipse cx="24" cy="56" rx="14" ry="8" fill="#C2E6BA" opacity="0.8" />
        <ellipse cx="108" cy="58" rx="16" ry="8" fill="#C2E6BA" opacity="0.8" />

        {/* Mochi Resting */}
        <g transform="translate(64, 46)">
          {/* Leaves sprout */}
          <path d="M0 -18V-26" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M0 -26C2 -36 14 -40 20 -36C21 -26 10 -24 0 -26Z"
            fill="#79C57F"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M-1 -25C-4 -34 -16 -38 -22 -34C-22 -24 -11 -22 -1 -25Z"
            fill="#98D99C"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Body */}
          <ellipse cx="0" cy="0" rx="34" ry="22" fill="var(--color-highlight)" stroke="var(--color-primary)" strokeWidth="2.6" />

          {/* Peaceful closed eyes */}
          <path d="M-14 0C-12 -3 -8 -3 -6 0" stroke="var(--color-primary)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M6 0C8 -3 12 -3 14 0" stroke="var(--color-primary)" strokeWidth="2.4" strokeLinecap="round" />

          {/* Cheeks */}
          <ellipse cx="-18" cy="4" rx="5" ry="3.5" fill="#F8A7A7" opacity="0.85" />
          <ellipse cx="18" cy="4" rx="5" ry="3.5" fill="#F8A7A7" opacity="0.85" />

          {/* Sweet smile */}
          <path d="M-3 5C-1 8 1 8 3 5" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />

          {/* Paws */}
          <ellipse cx="-18" cy="16" rx="6" ry="4" fill="var(--color-highlight)" stroke="var(--color-primary)" strokeWidth="2" />
          <ellipse cx="18" cy="16" rx="6" ry="4" fill="var(--color-highlight)" stroke="var(--color-primary)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};

/* 9. Corner Leaves Branch (Top-right corner in image_c489dd4f.png) */
export const CornerLeaves: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 70 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-65"
      >
        <path d="M68 2C45 8 30 25 15 55" stroke="var(--color-primary-text)" strokeWidth="2" strokeLinecap="round" />
        {/* Leaves */}
        <path d="M52 10C42 4 36 12 40 22C46 22 56 16 52 10Z" fill="#B2DBBA" stroke="var(--color-primary-text)" strokeWidth="1.5" />
        <path d="M38 24C28 20 24 28 28 38C34 38 42 32 38 24Z" fill="#C4E7CB" stroke="var(--color-primary-text)" strokeWidth="1.5" />
        <path d="M25 40C16 38 14 46 18 54C24 54 30 48 25 40Z" fill="#B2DBBA" stroke="var(--color-primary-text)" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

/* 10. Cohesive Vector Sprout Companions (replaces cropped/pixelated PNGs cleanly) */
export const MochiHappyCompanion: React.FC<{ className?: string }> = ({
  className = 'w-20 h-20',
}) => (
  <div className={`relative flex items-center justify-center select-none ${className}`}>
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="60" cy="104" rx="36" ry="8" fill="var(--color-highlight)" opacity="0.65" />
      <path d="M60 44V33" stroke="var(--color-primary)" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M60 33C62 20 76 15 84 20C85 32 72 36 60 33Z"
        fill="#79C57F"
        stroke="var(--color-primary)"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M59 34C56 22 42 18 35 23C35 35 48 38 59 34Z"
        fill="#98D99C"
        stroke="var(--color-primary)"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <ellipse
        cx="60"
        cy="72"
        rx="36"
        ry="28"
        fill="var(--color-highlight)"
        stroke="var(--color-primary)"
        strokeWidth="3.2"
      />
      <ellipse cx="47" cy="57" rx="10" ry="4.5" fill="var(--color-surface)" opacity="0.8" transform="rotate(-18 47 57)" />
      <path d="M44 70C46.5 65.5 51.5 65.5 54 70" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
      <path d="M66 70C68.5 65.5 73.5 65.5 76 70" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="38" cy="76" rx="5.5" ry="3.8" fill="#F69D99" opacity="0.85" />
      <ellipse cx="82" cy="76" rx="5.5" ry="3.8" fill="#F69D99" opacity="0.85" />
      <path d="M56 76C58 80 62 80 64 76" stroke="var(--color-primary)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M92 42L94 47L99 49L94 51L92 56L90 51L85 49L90 47Z" fill="var(--color-secondary)" />
    </svg>
  </div>
);

export const MochiThinkingCompanion: React.FC<{ className?: string }> = ({
  className = 'w-20 h-20',
}) => (
  <div className={`relative flex items-center justify-center select-none ${className}`}>
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="60" cy="104" rx="35" ry="7.5" fill="var(--color-highlight)" opacity="0.6" />
      <circle cx="92" cy="30" r="8" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2.2" />
      <circle cx="82" cy="42" r="4" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M90 30C90 28 94 28 94 30C94 32 92 33 92 34" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" />
      <path d="M58 46V35" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 35C60 22 74 18 81 23C82 34 70 37 58 35Z" fill="#79C57F" stroke="var(--color-primary)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M57 36C54 24 41 21 34 26C35 36 47 39 57 36Z" fill="#98D99C" stroke="var(--color-primary)" strokeWidth="2.6" strokeLinejoin="round" />
      <ellipse cx="58" cy="73" rx="35" ry="27" fill="var(--color-highlight)" stroke="var(--color-primary)" strokeWidth="3.2" />
      <circle cx="46" cy="70" r="3" fill="var(--color-primary)" />
      <circle cx="70" cy="70" r="3" fill="var(--color-primary)" />
      <ellipse cx="38" cy="76" rx="5" ry="3.5" fill="#F69D99" opacity="0.8" />
      <ellipse cx="78" cy="76" rx="5" ry="3.5" fill="#F69D99" opacity="0.8" />
      <path d="M55 78C57 77 60 77 62 78" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="67" cy="86" rx="6.5" ry="5" fill="#E7F1DF" stroke="var(--color-primary)" strokeWidth="2.2" />
    </svg>
  </div>
);

export const MochiRestingCompanion: React.FC<{ className?: string }> = ({
  className = 'w-20 h-20',
}) => (
  <div className={`relative flex items-center justify-center select-none ${className}`}>
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="60" cy="102" rx="40" ry="9" fill="#DDEBCF" opacity="0.75" />
      <path d="M60 48V38" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 38C63 26 76 22 83 27C83 37 71 40 60 38Z" fill="#79C57F" stroke="var(--color-primary)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M59 39C55 28 42 25 36 30C37 39 49 42 59 39Z" fill="#98D99C" stroke="var(--color-primary)" strokeWidth="2.6" strokeLinejoin="round" />
      <ellipse cx="60" cy="76" rx="37" ry="25" fill="var(--color-highlight)" stroke="var(--color-primary)" strokeWidth="3.2" />
      <path d="M44 74C46.5 77 51.5 77 54 74" stroke="var(--color-primary)" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M66 74C68.5 77 73.5 77 76 74" stroke="var(--color-primary)" strokeWidth="2.8" strokeLinecap="round" />
      <ellipse cx="38" cy="79" rx="5.5" ry="3.5" fill="#F69D99" opacity="0.8" />
      <ellipse cx="82" cy="79" rx="5.5" ry="3.5" fill="#F69D99" opacity="0.8" />
      <path d="M57 81C59 83 61 83 63 81" stroke="var(--color-primary)" strokeWidth="2.3" strokeLinecap="round" />
      <text x="86" y="42" fill="var(--color-primary)" fontSize="12" fontWeight="700" opacity="0.7">z</text>
      <text x="94" y="32" fill="var(--color-secondary)" fontSize="14" fontWeight="700" opacity="0.85">Z</text>
    </svg>
  </div>
);

export const WarmGiftEnvelopeVector: React.FC<{ className?: string }> = ({
  className = 'w-14 h-14',
}) => (
  <div className={`relative flex items-center justify-center select-none ${className}`}>
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="44" cy="76" rx="26" ry="5.5" fill="var(--color-highlight)" opacity="0.65" />
      <rect x="14" y="26" width="60" height="44" rx="12" fill="#FFF8EF" stroke="var(--color-primary)" strokeWidth="2.8" />
      <path d="M16 30L44 51L72 30" stroke="var(--color-primary)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="44" cy="48" r="9" fill="#FFF0E1" stroke="var(--color-secondary)" strokeWidth="2.2" />
      <path
        d="M44 45.2C42.7 43.4 40 43.7 39.2 45.4C38.2 47.6 40.6 50 44 52.5C47.4 50 49.8 47.6 48.8 45.4C48 43.7 45.3 43.4 44 45.2Z"
        fill="#E78A45"
      />
      <path d="M68 16L69.5 20L73.5 21.5L69.5 23L68 27L66.5 23L62.5 21.5L66.5 20Z" fill="var(--color-secondary)" />
    </svg>
  </div>
);

