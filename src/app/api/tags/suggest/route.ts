import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: NextRequest) {
  try {
    const { content, title } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '메모 내용이 필요합니다.' },
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

    // 메모 제목과 내용을 바탕으로 태그 추천 프롬프트 작성
    const prompt = title
      ? `다음 메모의 내용을 분석하여 적절한 태그를 추천해주세요. 최대 5개의 태그를 쉼표로 구분하여 반환해주세요. 태그는 한글이나 영어로 작성할 수 있으며, 메모의 핵심 키워드를 반영해야 합니다.

제목: ${title}

내용:
${content}

태그만 반환해주세요 (예: React, 학습, 개발, 웹개발, 프론트엔드)`
      : `다음 메모의 내용을 분석하여 적절한 태그를 추천해주세요. 최대 5개의 태그를 쉼표로 구분하여 반환해주세요. 태그는 한글이나 영어로 작성할 수 있으며, 메모의 핵심 키워드를 반영해야 합니다.

${content}

태그만 반환해주세요 (예: React, 학습, 개발, 웹개발, 프론트엔드)`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    })

    const tagsText = response.text.trim()

    if (!tagsText) {
      return NextResponse.json(
        { error: '태그 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 태그 파싱: 쉼표로 구분하고 공백 제거
    const tags = tagsText
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5) // 최대 5개로 제한

    if (tags.length === 0) {
      return NextResponse.json(
        { error: '태그를 추출할 수 없습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('태그 추천 오류:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '태그 추천 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

