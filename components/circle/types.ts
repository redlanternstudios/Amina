// Circle types shared across all circle components
// No business logic — pure type definitions only

export interface Circle {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  is_public: boolean
  creator_id: string
  created_at: string
}

export interface MyCircle extends Circle {
  role: string
  last_message_at: string | null
  unread: boolean
}

export interface CircleMember {
  id: string
  circle_id: string
  user_id: string
  role: string
  status: string
  joined_at: string
  profiles?: {
    display_name?: string
    full_name?: string
    avatar_url?: string | null
  }
}

export interface CreateCircleInput {
  name: string
  description?: string
  is_public: boolean
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  circles?: T
}
