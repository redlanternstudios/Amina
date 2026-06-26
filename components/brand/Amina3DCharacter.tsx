interface Amina3DCharacterProps {
  size?: number
  className?: string
  /** 'full' = head + shoulders portrait | 'avatar' = circular crop for small sizes */
  variant?: 'full' | 'avatar'
}

/**
 * Amina — 3D illustrated character.
 * Warm, faith-forward Muslim woman in a soft clay/3D style.
 * Brand palette: Cream · Dusty Rose (#C9796A) · Soft Olive (#8E9878) · Muted Gold (#D7BA82) · Charcoal (#2C2926)
 */
export default function Amina3DCharacter({
  size = 320,
  className,
  variant = 'full',
}: Amina3DCharacterProps) {
  const id = 'a3d'

  if (variant === 'avatar') {
    // Circular crop — head only, for bubble / small uses
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="Amina"
      >
        <defs>
          <radialGradient id={`${id}bg`} cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#EDD9C8" />
            <stop offset="100%" stopColor="#F2ECE4" />
          </radialGradient>
          <radialGradient id={`${id}skin`} cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#D4A574" />
            <stop offset="55%" stopColor="#C08A5A" />
            <stop offset="100%" stopColor="#9A6535" />
          </radialGradient>
          <radialGradient id={`${id}hij`} cx="40%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#D8897A" />
            <stop offset="55%" stopColor="#C9796A" />
            <stop offset="100%" stopColor="#8B4A3D" />
          </radialGradient>
          <radialGradient id={`${id}fs`} cx="68%" cy="68%" r="55%">
            <stop offset="0%" stopColor="#8B5A35" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#8B5A35" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${id}circ`}>
            <circle cx="60" cy="60" r="58" />
          </clipPath>
          <filter id={`${id}sh`}>
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#2C2926" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Background */}
        <circle cx="60" cy="60" r="60" fill="url(#a3dbg)" />

        <g clipPath={`url(#${id}circ)`}>
          {/* Shoulders / hijab body base */}
          <path
            d="M 5 120 Q 5 92 28 80 Q 44 72 60 70 Q 76 72 92 80 Q 115 92 115 120 Z"
            fill="#B5655A"
          />

          {/* Neck */}
          <rect x="50" y="64" width="20" height="20" rx="6" fill="url(#a3dskin)" />

          {/* Face oval */}
          <ellipse cx="60" cy="52" rx="30" ry="34" fill="url(#a3dskin)" filter={`url(#${id}sh)`} />
          <ellipse cx="60" cy="52" rx="30" ry="34" fill="url(#a3dfs)" />

          {/* Hijab dome */}
          <path
            d="M 28 48 Q 26 26 38 14 Q 48 4 60 3 Q 72 4 82 14 Q 94 26 92 48 Q 80 38 60 37 Q 40 38 28 48 Z"
            fill="url(#a3dhij)"
          />

          {/* Hijab side left */}
          <path
            d="M 28 48 Q 22 58 24 70 Q 26 80 34 86 Q 40 72 38 57 Q 36 49 28 48 Z"
            fill="#B5655A"
          />

          {/* Hijab side right */}
          <path
            d="M 92 48 Q 98 58 96 70 Q 94 80 86 86 Q 80 72 82 57 Q 84 49 92 48 Z"
            fill="#9E5A4D"
          />

          {/* Hijab fold lines */}
          <path d="M 34 46 Q 40 51 48 48" stroke="#9E5A4D" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M 86 46 Q 80 51 72 48" stroke="#8A4A40" strokeWidth="1" fill="none" opacity="0.5" />

          {/* Eyebrows */}
          <path d="M 43 45 Q 48 42 53 43" stroke="#5C3A1E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 67 43 Q 72 42 77 45" stroke="#5C3A1E" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Left eye */}
          <ellipse cx="48" cy="51" rx="6" ry="4.5" fill="white" />
          <ellipse cx="48" cy="51" rx="4" ry="4" fill="#3C2010" />
          <ellipse cx="46.5" cy="49.5" rx="1.2" ry="1.2" fill="white" />

          {/* Right eye */}
          <ellipse cx="72" cy="51" rx="6" ry="4.5" fill="white" />
          <ellipse cx="72" cy="51" rx="4" ry="4" fill="#3C2010" />
          <ellipse cx="70.5" cy="49.5" rx="1.2" ry="1.2" fill="white" />

          {/* Nose hint */}
          <path d="M 60 56 Q 57 61 58 63 Q 60 65 62 63 Q 63 61 60 56 Z" fill="#B07848" opacity="0.4" />

          {/* Cheeks */}
          <ellipse cx="40" cy="60" rx="9" ry="6" fill="#E09080" opacity="0.18" />
          <ellipse cx="80" cy="60" rx="9" ry="6" fill="#E09080" opacity="0.18" />

          {/* Smile */}
          <path d="M 51 68 Q 56 73 60 73 Q 64 73 69 68" stroke="#C06848" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Gold star accent on hijab */}
          <path
            d="M 76 14 C 77 11 77.5 10.5 80 9.5 C 77.5 8.5 77 8 76 5 C 75 8 74.5 8.5 72 9.5 C 74.5 10.5 75 11 76 14 Z"
            fill="#D7BA82"
            opacity="0.9"
          />
        </g>
      </svg>
    )
  }

  // Full portrait — head + shoulders
  return (
    <svg
      width={size}
      height={Math.round(size * 1.2)}
      viewBox="0 0 320 384"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Amina"
    >
      <defs>
        {/* Background */}
        <radialGradient id={`${id}fbg`} cx="50%" cy="58%" r="52%">
          <stop offset="0%" stopColor="#EDD9C8" />
          <stop offset="100%" stopColor="#F7F2EB" />
        </radialGradient>

        {/* Skin — warm medium-brown inclusive tone */}
        <radialGradient id={`${id}fsk`} cx="36%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#D9AE7A" />
          <stop offset="50%" stopColor="#C08A5A" />
          <stop offset="100%" stopColor="#9A6535" />
        </radialGradient>

        {/* Hijab dome */}
        <radialGradient id={`${id}fhd`} cx="38%" cy="22%" r="72%">
          <stop offset="0%" stopColor="#DC9080" />
          <stop offset="50%" stopColor="#C9796A" />
          <stop offset="100%" stopColor="#8C4A3D" />
        </radialGradient>

        {/* Hijab body / drape */}
        <radialGradient id={`${id}fhb`} cx="50%" cy="10%" r="80%">
          <stop offset="0%" stopColor="#C9796A" />
          <stop offset="100%" stopColor="#7A3A2D" />
        </radialGradient>

        {/* Face shadow (3D depth) */}
        <radialGradient id={`${id}ffs`} cx="72%" cy="70%" r="58%">
          <stop offset="0%" stopColor="#8B5A35" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8B5A35" stopOpacity="0" />
        </radialGradient>

        {/* Eye iris */}
        <radialGradient id={`${id}feye`} cx="38%" cy="33%" r="60%">
          <stop offset="0%" stopColor="#5C3A1E" />
          <stop offset="100%" stopColor="#1C0A04" />
        </radialGradient>

        {/* Neck shadow */}
        <linearGradient id={`${id}fns`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9A6535" stopOpacity="0" />
          <stop offset="60%" stopColor="#9A6535" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#9A6535" stopOpacity="0.5" />
        </linearGradient>

        {/* Soft drop shadow filter */}
        <filter id={`${id}fsh`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="#2C2926" floodOpacity="0.14" />
        </filter>

        {/* Glow behind character */}
        <radialGradient id={`${id}glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8C4A8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F7F2EB" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow blob */}
      <ellipse cx="160" cy="230" rx="148" ry="140" fill={`url(#${id}glow)`} />

      {/* === BODY / SHOULDERS === */}
      {/* Main body shape — hijab continues into shoulders */}
      <path
        d="M 20 384 Q 18 310 58 278 Q 96 252 160 248 Q 224 252 262 278 Q 302 310 300 384 Z"
        fill="url(#a3dfhb)"
      />

      {/* Left shoulder highlight */}
      <path
        d="M 20 384 Q 18 320 55 285 Q 80 268 110 260 Q 105 290 104 322 Q 102 352 104 384 Z"
        fill="#B8685C"
        opacity="0.7"
      />

      {/* Right shoulder shadow */}
      <path
        d="M 300 384 Q 302 320 265 285 Q 240 268 210 260 Q 215 290 216 322 Q 218 352 216 384 Z"
        fill="#8C4A3D"
        opacity="0.6"
      />

      {/* Collar / hijab base frame */}
      <path
        d="M 105 254 Q 115 270 130 278 Q 145 284 160 285 Q 175 284 190 278 Q 205 270 215 254"
        stroke="#C9796A"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />

      {/* === NECK === */}
      <rect x="139" y="220" width="42" height="46" rx="12" fill="url(#a3dfsk)" />
      <rect x="158" y="220" width="23" height="46" rx="12" fill={`url(#${id}fns)`} />

      {/* === FACE === */}
      <ellipse
        cx="160"
        cy="164"
        rx="72"
        ry="84"
        fill="url(#a3dfsk)"
        filter={`url(#${id}fsh)`}
      />
      {/* Face depth shadow */}
      <ellipse cx="160" cy="164" rx="72" ry="84" fill={`url(#${id}ffs)`} />

      {/* === HIJAB DOME === */}
      {/* Main dome over head */}
      <path
        d="M 80 150 Q 76 90 100 56 Q 126 18 160 14 Q 194 18 220 56 Q 244 90 240 150 Q 220 122 160 120 Q 100 122 80 150 Z"
        fill="url(#a3dfhd)"
      />

      {/* Hijab left side drape */}
      <path
        d="M 80 150 Q 70 168 72 196 Q 74 220 88 238 Q 98 250 112 255 Q 116 226 114 196 Q 112 168 106 150 Q 93 138 80 150 Z"
        fill="#BA6860"
      />

      {/* Hijab right side drape */}
      <path
        d="M 240 150 Q 250 168 248 196 Q 246 220 232 238 Q 222 250 208 255 Q 204 226 206 196 Q 208 168 214 150 Q 227 138 240 150 Z"
        fill="#9E5A4D"
      />

      {/* Hijab fold lines — 3D fabric depth */}
      <path d="M 94 148 Q 108 158 124 153" stroke="#9E5A4D" strokeWidth="1.5" fill="none" opacity="0.55" />
      <path d="M 226 148 Q 212 158 196 153" stroke="#8A4A40" strokeWidth="1.5" fill="none" opacity="0.55" />
      <path d="M 86 168 Q 96 176 106 170" stroke="#9E5A4D" strokeWidth="1" fill="none" opacity="0.35" />
      <path d="M 234 168 Q 224 176 214 170" stroke="#8A4A40" strokeWidth="1" fill="none" opacity="0.35" />

      {/* Hijab highlight shimmer (top of dome) */}
      <path
        d="M 130 28 Q 160 20 190 28 Q 178 32 160 33 Q 142 32 130 28 Z"
        fill="white"
        opacity="0.18"
      />

      {/* === FACE FEATURES === */}

      {/* Eyebrows */}
      <path d="M 118 140 Q 128 134 140 136" stroke="#4A2E12" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M 180 136 Q 192 134 202 140" stroke="#4A2E12" strokeWidth="2.8" strokeLinecap="round" fill="none" />

      {/* Left eye */}
      <ellipse cx="130" cy="154" rx="13" ry="9" fill="white" />
      <ellipse cx="130" cy="154" rx="9" ry="8.5" fill={`url(#${id}feye)`} />
      <ellipse cx="130" cy="154" rx="6" ry="6.5" fill="#1A0806" />
      <ellipse cx="127" cy="151" rx="2.2" ry="2.2" fill="white" />
      {/* Lash line */}
      <path d="M 117 154 Q 130 146 143 154" stroke="#4A2E12" strokeWidth="1.2" fill="none" opacity="0.6" />

      {/* Right eye */}
      <ellipse cx="190" cy="154" rx="13" ry="9" fill="white" />
      <ellipse cx="190" cy="154" rx="9" ry="8.5" fill={`url(#${id}feye)`} />
      <ellipse cx="190" cy="154" rx="6" ry="6.5" fill="#1A0806" />
      <ellipse cx="187" cy="151" rx="2.2" ry="2.2" fill="white" />
      {/* Lash line */}
      <path d="M 177 154 Q 190 146 203 154" stroke="#4A2E12" strokeWidth="1.2" fill="none" opacity="0.6" />

      {/* Nose — subtle 3D bump */}
      <path
        d="M 160 166 Q 152 180 154 188 Q 157 194 160 194 Q 163 194 166 188 Q 168 180 160 166 Z"
        fill="#A87040"
        opacity="0.38"
      />
      {/* Nose bridge highlight */}
      <path d="M 159 167 Q 158 174 158 180" stroke="#D4A574" strokeWidth="1.5" fill="none" opacity="0.3" />

      {/* Cheek blush */}
      <ellipse cx="110" cy="180" rx="20" ry="13" fill="#E09080" opacity="0.17" />
      <ellipse cx="210" cy="180" rx="20" ry="13" fill="#E09080" opacity="0.17" />

      {/* Mouth — warm smile */}
      <path
        d="M 140 200 Q 150 210 160 211 Q 170 210 180 200"
        stroke="#C06848"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Lower lip hint */}
      <path
        d="M 145 206 Q 160 216 175 206"
        stroke="#C06848"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />

      {/* === BRAND ACCENTS === */}

      {/* Muted gold four-point star — upper left of hijab */}
      <path
        d="M 104 54 C 106.5 47 107 46 112 44 C 107 42 106.5 41 104 34 C 101.5 41 101 42 96 44 C 101 46 101.5 47 104 54 Z"
        fill="#D7BA82"
        opacity="0.92"
      />

      {/* Smaller star — right side */}
      <path
        d="M 210 42 C 211.5 37.5 212 37 215 35.5 C 212 34 211.5 33.5 210 29 C 208.5 33.5 208 34 205 35.5 C 208 37 208.5 37.5 210 42 Z"
        fill="#D7BA82"
        opacity="0.75"
      />

      {/* Crescent hint on hijab (very subtle) */}
      <path
        d="M 162 22 A 9 9 0 1 0 162 40 A 6 6 0 1 1 162 22 Z"
        fill="#D7BA82"
        opacity="0.25"
      />
    </svg>
  )
}
