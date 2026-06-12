// ─── Circle Types ─────────────────────────────────────────────────────────
// Shared types for the Circle feature (Amina)

export interface Circle {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  avatar_url: string | null
  is_private: boolean
  is_public: boolean
  category: string | null
  member_count: number | null
  created_by: string
  created_at: string
}

export interface MyCircle extends Circle {
  role: 'admin' | 'member'
  last_message_at: string | null
  unread: boolean
}

export interface CircleMember {
  id: string
  circle_id: string
  user_id: string
  role: 'admin' | 'member'
  created_at: string
  display_name: string
  avatar_url: string | null
}

export interface CircleMessage {
  id: string
  circle_id: string
  user_id: string
  content: string
  created_at: string
  sender_name: string
  sender_avatar_url: string | null
}

export interface CirclePost {
  id: string
  circle_id: string
  user_id: string
  title: string | null
  content: string
  image_url: string | null
  created_at: string
  author_name: string
  author_avatar_url: string | null
  reactions?: CirclePostReaction[]
}

export interface CirclePostReaction {
  id: string
  post_id: string
  user_id: string
  reaction_type: string
  created_at: string
}

export interface CircleMessageReaction {
  id: string
  message_id: string
  user_id: string
  reaction_type: string
  created_at: string
}

export interface CircleJoinRequest {
  id: string
  circle_id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type CircleCategory =
  | 'general'
  | 'quran_study'
  | 'hadith_study'
  | 'fiqh'
  | 'dua_dhikr'
  | 'community'
  | 'events'

export type CircleTab = 'posts' | 'chat' | 'members'
