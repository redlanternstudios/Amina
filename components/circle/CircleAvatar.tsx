'use client'

interface Props {
  name: string
  avatarUrl?: string | null
  imageUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 32, md: 40, lg: 56 }
const textMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg' }

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const bgColors = [
  'bg-emerald-500', 'bg-blue-500', 'bg-purple-500',
  'bg-rose-500', 'bg-amber-500', 'bg-teal-500',
]

function getColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return bgColors[Math.abs(hash) % bgColors.length]
}

export default function CircleAvatar({ name, avatarUrl, imageUrl, size = 'md' }: Props) {
  const src = avatarUrl ?? imageUrl ?? null
  const px = sizeMap[size]
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: px, height: px }}
      />
    )
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${getColor(name)} ${textMap[size]}`}
      style={{ width: px, height: px }}
    >
      {getInitials(name)}
    </div>
  )
}
