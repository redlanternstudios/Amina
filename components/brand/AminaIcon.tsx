interface AminaIconProps {
  size?: number
  className?: string
  crescentColor?: string
  starColor?: string
  title?: string
}

/**
 * Amina brand mark — a soft crescent (dusty rose) with a small
 * four-point star (soft olive) nestled in its opening.
 * Spec §8: crescent on left/lower curve, star near crescent opening.
 */
export default function AminaIcon({
  size = 32,
  className,
  crescentColor = 'var(--amina-dusty-rose)',
  starColor = 'var(--amina-soft-olive)',
  title = 'Amina',
}: AminaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      {/* Crescent: outer circle minus an offset inner circle */}
      <path
        d="M34.5 8.2A18 18 0 1 0 40 24a14 14 0 1 1-5.5-15.8Z"
        fill={crescentColor}
      />
      {/* Four-point star near the crescent opening */}
      <path
        d="M33 16c.6 2.4 1.6 3.4 4 4-2.4.6-3.4 1.6-4 4-.6-2.4-1.6-3.4-4-4 2.4-.6 3.4-1.6 4-4Z"
        fill={starColor}
      />
    </svg>
  )
}
