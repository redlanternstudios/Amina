'use client'

export default function TinyAminaBubble() {
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F7F2EB 0%, #FAFAF8 100%)',
        border: '1.5px solid var(--amina-hairline)',
        boxShadow: '0 2px 6px rgba(140, 80, 60, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Create_a_single_full_body_tran-cvTn9V4vrhJG2cNRky6388cnFqL23H.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
