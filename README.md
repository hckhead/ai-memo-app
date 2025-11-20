# 📝 메모 앱 (Memo App)

**핸즈온 실습용 Next.js 메모 애플리케이션**

Supabase 기반의 완전한 CRUD 기능을 갖춘 메모 앱으로, MCP 연동 및 GitHub PR 생성 실습의 기반이 되는 프로젝트입니다.

## 🚀 주요 기능

- ✅ 메모 생성, 읽기, 수정, 삭제 (CRUD)
- 📂 카테고리별 메모 분류 (개인, 업무, 학습, 아이디어, 기타)
- 🏷️ 태그 시스템으로 메모 태깅
- 🤖 **AI 자동 태그 추천** (Google Gemini) - 새 메모 작성 시 자동으로 태그 생성
- 🔍 제목, 내용, 태그 기반 실시간 검색
- 📱 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 💾 Supabase 데이터베이스 기반 데이터 저장
- 🤖 AI 요약 기능 (Google Gemini) 및 요약 이력 저장
- 🎨 모던한 UI/UX with Tailwind CSS

## 🛠 기술 스택

- **Framework**: Next.js 15.4.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Package Manager**: npm

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Google Gemini API Key
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
# Get these values from your Supabase project settings: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정 > API에서 URL과 키 복사
3. Supabase CLI로 프로젝트 연결:

```bash
supabase login
supabase link --project-ref your-project-ref
```

4. 마이그레이션 적용 (이미 적용되어 있음):

```bash
# MCP를 통해 자동으로 적용되었습니다
# 또는 수동으로 적용하려면:
supabase db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 브라우저 접속

```
http://localhost:3000
```

## 📁 프로젝트 구조

```
memo-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── summarize/
│   │   │       └── route.ts      # AI 요약 API
│   │   ├── globals.css            # 글로벌 스타일
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   └── page.tsx               # 메인 페이지
│   ├── components/
│   │   ├── MemoForm.tsx           # 메모 생성/편집 폼
│   │   ├── MemoItem.tsx           # 개별 메모 카드
│   │   ├── MemoList.tsx           # 메모 목록 및 필터
│   │   └── MemoViewer.tsx         # 메모 상세 보기
│   ├── hooks/
│   │   └── useMemos.ts            # 메모 관리 커스텀 훅
│   ├── lib/
│   │   ├── supabaseClient.ts      # Supabase 클라이언트
│   │   └── supabaseAdmin.ts       # Supabase 관리자 클라이언트
│   ├── services/
│   │   ├── memoRepository.ts       # 메모 데이터 액세스 계층
│   │   └── tagSuggestionService.ts # 태그 추천 서비스
│   ├── types/
│   │   └── memo.ts                # 메모 타입 정의
│   └── utils/
│       ├── localStorage.ts         # LocalStorage 유틸리티 (레거시)
│       └── seedData.ts            # 샘플 데이터 시딩 (레거시)
└── README.md                      # 프로젝트 문서
```

## 💡 주요 컴포넌트

### MemoItem

- 개별 메모를 카드 형태로 표시
- 편집/삭제 액션 버튼
- 카테고리 배지 및 태그 표시
- 날짜 포맷팅 및 텍스트 클램핑

### MemoForm

- 메모 생성/편집을 위한 모달 폼
- 제목, 내용, 카테고리, 태그 입력
- 태그 추가/제거 기능
- **AI 자동 태그 생성 기능** (새 메모 작성 시에만 사용 가능)
- 폼 검증 및 에러 처리

### MemoList

- 메모 목록 그리드 표시
- 실시간 검색 및 카테고리 필터링
- 통계 정보 및 빈 상태 처리
- 반응형 그리드 레이아웃

### MemoViewer

- 메모 상세 보기 모달
- AI 요약 기능 및 요약 이력 표시
- 편집/삭제 액션

## 📊 데이터 구조

### 메모 (memos 테이블)

```typescript
interface Memo {
  id: string                    // UUID
  title: string                 // 메모 제목
  content: string               // 메모 내용 (Markdown 지원)
  category: string              // 카테고리 (personal, work, study, idea, other)
  tags: string[]                // 태그 배열
  createdAt: string             // 생성 날짜 (ISO string)
  updatedAt: string             // 수정 날짜 (ISO string)
}
```

### 메모 요약 (memo_summaries 테이블)

```typescript
interface MemoSummary {
  id: string                     // UUID
  memo_id: string                // 메모 ID (외래키)
  summary: string                // 요약 내용
  created_at: string              // 생성 날짜
  model: string                   // 사용된 AI 모델
  meta: Record<string, any>      // 메타데이터
}
```

## 🗄️ 데이터베이스 스키마

### memos 테이블

- `id` (UUID, Primary Key)
- `title` (TEXT, NOT NULL)
- `content` (TEXT, NOT NULL)
- `category` (TEXT, NOT NULL, DEFAULT 'personal')
- `tags` (TEXT[], DEFAULT '{}')
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

### memo_summaries 테이블

- `id` (UUID, Primary Key)
- `memo_id` (UUID, Foreign Key → memos.id)
- `summary` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `model` (TEXT)
- `meta` (JSONB)

### 인덱스

- `idx_memos_category`: 카테고리별 검색 최적화
- `idx_memos_created_at`: 생성일 기준 정렬 최적화
- `idx_memos_updated_at`: 수정일 기준 정렬 최적화
- `idx_memo_summaries_memo_id`: 메모별 요약 조회 최적화

## 🔧 개발 가이드

### 메모 CRUD 작업

```typescript
import { useMemos } from '@/hooks/useMemos'

const {
  memos,              // 필터링된 메모 목록
  allMemos,           // 모든 메모 목록
  loading,             // 로딩 상태
  error,               // 에러 메시지
  createMemo,          // 메모 생성 (async)
  updateMemo,          // 메모 수정 (async)
  deleteMemo,          // 메모 삭제 (async)
  searchMemos,         // 검색
  filterByCategory,    // 카테고리 필터링
  stats,               // 통계 정보
} = useMemos()

// 메모 생성 예시
await createMemo({
  title: '새 메모',
  content: '메모 내용',
  category: 'personal',
  tags: ['태그1', '태그2'],
})
```

### 직접 데이터베이스 접근

```typescript
import { memoRepository } from '@/services/memoRepository'

// 모든 메모 가져오기
const memos = await memoRepository.getAllMemos()

// 메모 생성
const newMemo = await memoRepository.createMemo(formData)

// 메모 업데이트
await memoRepository.updateMemo(id, formData)

// 메모 삭제
await memoRepository.deleteMemo(id)
```

### 요약 기능 사용

```typescript
import { memoSummaryRepository } from '@/services/memoRepository'

// 최신 요약 가져오기
const summary = await memoSummaryRepository.getLatestSummary(memoId)

// 요약 저장
await memoSummaryRepository.saveSummary(memoId, summary, 'gemini-2.0-flash-001')
```

### 자동 태그 추천 기능 사용

```typescript
import { tagSuggestionService } from '@/services/tagSuggestionService'

// 메모 내용 기반 태그 추천
const tags = await tagSuggestionService.suggestTags(
  'React 18 새로운 기능 학습',
  'React 18에서 새로 추가된 기능들을 학습해야 함...'
)
// 결과: ['React', '학습', '개발', '프론트엔드', '웹개발']
```

**사용 방법:**
- 새 메모 작성 또는 기존 메모 편집 시 "AI 태그 생성" 버튼 클릭
- 제목과 내용을 바탕으로 Gemini가 최대 5개의 태그를 자동 추천
- 추천된 태그는 기존 태그와 중복 없이 자동으로 추가됨
- 사용자가 추천된 태그를 수정하거나 삭제할 수 있음

## 🎯 실습 시나리오

이 프로젝트는 다음 3가지 실습의 기반으로 사용됩니다:

### 실습 1: Supabase MCP 마이그레이션 ✅ (완료)

- LocalStorage → Supabase 데이터베이스 전환
- MCP를 통한 자동 스키마 생성
- 기존 데이터 무손실 마이그레이션

### 실습 2: 기능 확장 + GitHub PR (60분)

- 메모 즐겨찾기 기능 추가
- Cursor Custom Modes로 PR 생성
- 코드 리뷰 및 협업 실습

### 실습 3: Playwright MCP 테스트 (45분)

- E2E 테스트 작성
- 브라우저 자동화 및 시각적 테스트
- 성능 측정 및 리포트

자세한 실습 가이드는 강의자료를 참고하세요.

## 🚀 배포

### Vercel 배포

```bash
npm run build
npx vercel --prod
```

환경 변수를 Vercel 대시보드에서 설정해야 합니다.

### Netlify 배포

```bash
npm run build
# dist 폴더를 Netlify에 드래그 앤 드롭
```

## 🔐 보안 참고사항

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용하세요
- 클라이언트에서는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`만 사용합니다
- Row Level Security (RLS) 정책이 활성화되어 있습니다
- 프로덕션 환경에서는 RLS 정책을 적절히 설정하세요

## 🤖 AI 기능 사용량 참고

이 앱은 Google Gemini API를 사용합니다:
- **AI 요약 기능**: 메모 상세 보기에서 요약 생성 시 사용
- **AI 자동 태그 추천**: 새 메모 작성 시 태그 생성 버튼 클릭 시 사용

각 기능은 API 호출 시 토큰을 소비하므로, 사용량에 주의하세요. Gemini API 무료 티어 제한을 확인하시기 바랍니다.

## 📄 라이선스

MIT License - 학습 및 실습 목적으로 자유롭게 사용 가능합니다.

## 🤝 기여

이 프로젝트는 교육용으로 제작되었습니다. 개선사항이나 버그 리포트는 이슈나 PR로 제출해 주세요.

---

**Made with ❤️ for hands-on workshop**
