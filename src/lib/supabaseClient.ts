import { createClient } from '@supabase/supabase-js'
import { Memo } from '@/types/memo'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface MemoSummaryRow {
  id: string
  memo_id: string
  summary: string
  created_at: string
}

// Helper function to convert MemoRow to Memo
export function memoRowToMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Helper function to convert Memo to MemoRow
export function memoToMemoRow(memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>): Omit<MemoRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: memo.title,
    content: memo.content,
    category: memo.category,
    tags: memo.tags,
  }
}

