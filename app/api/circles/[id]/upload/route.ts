import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify active membership
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('status')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'Not a member of this circle' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const postId = formData.get('postId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, MP4, WebM' }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Build storage path: circle-media/{circleId}/{postId or nanoid}/{filename}
    const ext = file.name.split('.').pop() || 'jpg'
    const storagePath = postId
      ? `${id}/${postId}/${crypto.randomUUID()}.${ext}`
      : `${id}/general/${crypto.randomUUID()}.${ext}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('circle-media')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading to circle-media:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('circle-media')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      url: publicUrl,
      path: storagePath,
    }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/circles/[id]/upload:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
