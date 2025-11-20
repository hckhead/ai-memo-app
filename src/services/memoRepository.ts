import { supabase } from '@/lib/supabaseClient'
import { Memo, MemoFormData } from '@/types/memo'
import { memoRowToMemo, memoToMemoRow, MemoRow } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export const memoRepository = {
  // 모든 메모 가져오기
  async getAllMemos(): Promise<Memo[]> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching memos:', error)
      throw new Error(`메모를 불러오는데 실패했습니다: ${error.message}`)
    }

    return (data || []).map(memoRowToMemo)
  },

  // 메모 생성
  async createMemo(formData: MemoFormData): Promise<Memo> {
    const now = new Date().toISOString()
    const newMemo: Memo = {
      id: uuidv4(),
      ...formData,
      createdAt: now,
      updatedAt: now,
    }

    const memoRow: MemoRow = {
      id: newMemo.id,
      title: newMemo.title,
      content: newMemo.content,
      category: newMemo.category,
      tags: newMemo.tags,
      created_at: newMemo.createdAt,
      updated_at: newMemo.updatedAt,
    }

    const { data, error } = await supabase
      .from('memos')
      .insert(memoRow)
      .select()
      .single()

    if (error) {
      console.error('Error creating memo:', error)
      throw new Error(`메모 생성에 실패했습니다: ${error.message}`)
    }

    return memoRowToMemo(data)
  },

  // 메모 업데이트
  async updateMemo(id: string, formData: MemoFormData): Promise<Memo> {
    const memoRow = memoToMemoRow(formData)

    const { data, error } = await supabase
      .from('memos')
      .update({
        ...memoRow,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating memo:', error)
      throw new Error(`메모 수정에 실패했습니다: ${error.message}`)
    }

    return memoRowToMemo(data)
  },

  // 메모 삭제
  async deleteMemo(id: string): Promise<void> {
    const { error } = await supabase.from('memos').delete().eq('id', id)

    if (error) {
      console.error('Error deleting memo:', error)
      throw new Error(`메모 삭제에 실패했습니다: ${error.message}`)
    }
  },

  // 특정 메모 가져오기
  async getMemoById(id: string): Promise<Memo | null> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('Error fetching memo:', error)
      throw new Error(`메모를 불러오는데 실패했습니다: ${error.message}`)
    }

    return data ? memoRowToMemo(data) : null
  },

  // 통계 정보 계산
  async getStats(): Promise<{
    total: number
    byCategory: Record<string, number>
  }> {
    const { data, error } = await supabase.from('memos').select('category')

    if (error) {
      console.error('Error fetching stats:', error)
      throw new Error(`통계 정보를 불러오는데 실패했습니다: ${error.message}`)
    }

    const total = data?.length || 0
    const byCategory = (data || []).reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return { total, byCategory }
  },
}

export const memoSummaryRepository = {
  // 메모의 최신 요약 가져오기
  async getLatestSummary(memoId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('memo_summaries')
      .select('summary')
      .eq('memo_id', memoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('Error fetching summary:', error)
      return null
    }

    return data?.summary || null
  },

  // 요약 저장
  async saveSummary(memoId: string, summary: string, model?: string, meta?: Record<string, unknown>): Promise<void> {
    const { error } = await supabase.from('memo_summaries').insert({
      memo_id: memoId,
      summary,
      model: model || 'gemini-2.0-flash-001',
      meta: meta || {},
    })

    if (error) {
      console.error('Error saving summary:', error)
      throw new Error(`요약 저장에 실패했습니다: ${error.message}`)
    }
  },
}

