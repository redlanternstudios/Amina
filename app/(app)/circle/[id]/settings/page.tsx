// NOOP — Circle feature deprecated for v1
import { redirect } from 'next/navigation'
export default function NoopCircleSettingsPage() {
  redirect('/chat')
}
