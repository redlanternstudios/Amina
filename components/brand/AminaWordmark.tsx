import AminaIcon from './AminaIcon'

type Size = 'sm' | 'md' | 'lg' | 'xl'
type Tone = 'gradient' | 'charcoal'

interface AminaWordmarkProps {
  size?: Size
  tone?: Tone
  showSignature?: boolean
  showIcon?: boolean
  className?: string
}

const SIZES: Record<Size, { word: string; icon: number; sig: string }> = {
  sm: { word: 'text-2xl', icon: 16, sig: 'text-[10px]' },
  md: { word: 'text-4xl', icon: 22, sig: 'text-xs' },
  lg: { word: 'text-6xl', icon: 30, sig: 'text-sm' },
  xl: { word: 'text-7xl', icon: 38, sig: 'text-base' },
}

/**
 * Amina wordmark — elegant italic Canela/Cormorant "Amina" with a small
 * crescent-star mark and the "by RedLantern Studios™" signature line.
 * Spec §3: soft olive → dusty rose → muted gold blend across the wordmark.
 */
export default function AminaWordmark({
  size = 'lg',
  tone = 'gradient',
  showSignature = true,
  showIcon = true,
  className,
}: AminaWordmarkProps) {
  const s = SIZES[size]

  return (
    <div className={`flex flex-col items-center text-center ${className ?? ''}`}>
      <div className="flex items-baseline gap-2">
        <span
          className={`font-display italic leading-none ${s.word}`}
          style={
            tone === 'gradient'
              ? {
                  backgroundImage:
                    'linear-gradient(95deg, var(--amina-soft-olive) 0%, var(--amina-dusty-rose) 55%, var(--amina-muted-gold) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }
              : { color: 'var(--amina-soft-charcoal)' }
          }
        >
          Amina
        </span>
        {showIcon && (
          <AminaIcon
            size={s.icon}
            crescentColor={tone === 'charcoal' ? 'var(--amina-soft-charcoal)' : 'var(--amina-dusty-rose)'}
            starColor={tone === 'charcoal' ? 'var(--amina-soft-charcoal)' : 'var(--amina-soft-olive)'}
          />
        )}
      </div>
      {showSignature && (
        <span className={`font-display italic mt-1 ${s.sig}`} style={{ color: 'var(--amina-muted-text)' }}>
          by RedLantern Studios™
        </span>
      )}
    </div>
  )
}
