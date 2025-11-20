'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Memo,
  MemoFormData,
  MEMO_CATEGORIES,
  DEFAULT_CATEGORIES,
} from '@/types/memo'
import { tagSuggestionService } from '@/services/tagSuggestionService'

// MDEditor를 동적으로 import (SSR 방지)
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
})

interface MemoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MemoFormData) => Promise<void>
  editingMemo?: Memo | null
  isSubmitting?: boolean
}

export default function MemoForm({
  isOpen,
  onClose,
  onSubmit,
  editingMemo,
  isSubmitting = false,
}: MemoFormProps) {
  const [formData, setFormData] = useState<MemoFormData>({
    title: '',
    content: '',
    category: 'personal',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [tagError, setTagError] = useState<string | null>(null)

  // 편집 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (editingMemo) {
      setFormData({
        title: editingMemo.title,
        content: editingMemo.content,
        category: editingMemo.category,
        tags: editingMemo.tags,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'personal',
        tags: [],
      })
    }
    setTagInput('')
    setTagError(null)
  }, [editingMemo, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }
    try {
      await onSubmit(formData)
      // onClose는 부모 컴포넌트에서 처리
    } catch (error) {
      // 에러는 부모 컴포넌트에서 처리
      console.error('Form submission error:', error)
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // 자동 태그 생성 (새 메모 작성 시에만 사용 가능)
  const handleGenerateTags = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      setTagError('제목 또는 내용을 먼저 입력해주세요.')
      return
    }

    setIsGeneratingTags(true)
    setTagError(null)

    try {
      const suggestedTags = await tagSuggestionService.suggestTags(
        formData.title,
        formData.content
      )

      if (suggestedTags.length > 0) {
        // 기존 태그와 중복 제거하며 병합
        const newTags = [...formData.tags]
        suggestedTags.forEach(tag => {
          if (!newTags.includes(tag)) {
            newTags.push(tag)
          }
        })

        setFormData(prev => ({
          ...prev,
          tags: newTags,
        }))
      } else {
        setTagError('추천할 태그를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('태그 생성 오류:', error)
      setTagError(
        error instanceof Error
          ? error.message
          : '태그 생성 중 오류가 발생했습니다.'
      )
    } finally {
      setIsGeneratingTags(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingMemo ? '메모 편집' : '새 메모 작성'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                제목 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="placeholder-gray-400 text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="메모 제목을 입력하세요"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                카테고리
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {DEFAULT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {MEMO_CATEGORIES[category]}
                  </option>
                ))}
              </select>
            </div>

            {/* 내용 */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                내용 *
              </label>
              <div data-color-mode="light">
                <MDEditor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData(prev => ({
                      ...prev,
                      content: value || '',
                    }))
                  }
                  preview="live"
                  visibleDragbar={false}
                  height={400}
                  highlightEnable={false}
                />
              </div>
            </div>

            {/* 태그 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  태그
                </label>
                <button
                  type="button"
                  onClick={handleGenerateTags}
                  disabled={isGeneratingTags || (!formData.title.trim() && !formData.content.trim())}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingTags ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-3 w-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      생성 중...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      AI 태그 생성
                    </>
                  )}
                </button>
              </div>
              {tagError && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700">{tagError}</p>
                </div>
              )}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="placeholder-gray-400 text-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="태그를 입력하고 Enter를 누르세요"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  추가
                </button>
              </div>

              {/* 태그 목록 */}
              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '처리 중...' : editingMemo ? '수정하기' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
