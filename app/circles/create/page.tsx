// NOOP — Circle feature deprecated for v1
import { redirect } from 'next/navigation'
export default function NoopCirclesCreatePage() {
  redirect('/chat')
}
