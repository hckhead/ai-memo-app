/**
 * 태그 추천 서비스
 * Gemini API를 사용하여 메모 내용 기반 태그를 자동으로 추천합니다.
 */

export interface TagSuggestionResponse {
  tags: string[]
}

export const tagSuggestionService = {
  /**
   * 메모 제목과 내용을 기반으로 태그를 추천합니다.
   * @param title 메모 제목
   * @param content 메모 내용
   * @returns 추천된 태그 배열
   */
  async suggestTags(title: string, content: string): Promise<string[]> {
    try {
      const response = await fetch('/api/tags/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || undefined,
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '태그 추천에 실패했습니다.')
      }

      const data: TagSuggestionResponse = await response.json()
      return data.tags || []
    } catch (error) {
      console.error('태그 추천 오류:', error)
      throw error
    }
  },
}

