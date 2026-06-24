import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

export async function ensureAuth(): Promise<string> {
  if (!supabase) {
    const localId = localStorage.getItem('breathprint_user_id')
    if (localId) return localId
    const newId = crypto.randomUUID()
    localStorage.setItem('breathprint_user_id', newId)
    return newId
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) return session.user.id

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.user!.id
}

export async function uploadAudio(
  userId: string,
  screeningId: string,
  type: 'breath' | 'cough',
  blob: Blob,
): Promise<string | null> {
  if (!supabase) return null

  const ext = blob.type.includes('webm') ? 'webm' : 'wav'
  const path = `${userId}/${screeningId}/${type}.${ext}`

  const { error } = await supabase.storage
    .from('audio-recordings')
    .upload(path, blob, { upsert: true, contentType: blob.type })

  if (error) throw error

  const { data } = supabase.storage.from('audio-recordings').getPublicUrl(path)
  return data.publicUrl
}
