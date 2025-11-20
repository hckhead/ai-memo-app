import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { memoSummaryRepository } from '@/services/memoRepository'

export async function POST(request: NextRequest) {
  try {
    const { content, title, memoId } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '메모 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    if (!memoId || typeof memoId !== 'string') {
      return NextResponse.json(
        { error: '메모 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    // 메모 제목과 내용을 함께 요약 프롬프트에 포함
    const prompt = title
      ? `다음 메모를 간결하고 명확하게 요약해주세요.\n\n제목: ${title}\n\n내용:\n${content}`
      : `다음 메모를 간결하고 명확하게 요약해주세요.\n\n${content}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    })

    const summary = response.text

    if (!summary) {
      return NextResponse.json(
        { error: '요약 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // Supabase에 요약 저장
    try {
      await memoSummaryRepository.saveSummary(
        memoId,
        summary,
        'gemini-2.0-flash-001',
        { title, contentLength: content.length }
      )
    } catch (saveError) {
      console.error('Failed to save summary to database:', saveError)
      // 요약 저장 실패해도 요약은 반환
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('요약 생성 오류:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '요약 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
