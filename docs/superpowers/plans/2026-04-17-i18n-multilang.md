# i18n Multi-language Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5-language support (EN, KO, JA, VI, RU) to all customer-facing pages with URL-based language routing.

**Architecture:** Install `react-i18next` + `i18next`. Create translation JSON files for 5 languages. Add `/:lang` prefix to customer routes. Create a `LanguageSwitcher` dropdown on Navbar. Extract all hardcoded strings from customer pages/components into translation keys.

**Tech Stack:** react-i18next, i18next, react-router-dom (existing)

---

### File Structure

```
client/src/
├── i18n/
│   ├── index.ts              # [CREATE] i18next init + config
│   └── locales/
│       ├── en.json           # [CREATE] English translations (default)
│       ├── ko.json           # [CREATE] Korean translations
│       ├── ja.json           # [CREATE] Japanese translations
│       ├── vi.json           # [CREATE] Vietnamese translations
│       └── ru.json           # [CREATE] Russian translations
├── components/
│   ├── LanguageSwitcher.tsx   # [CREATE] Language dropdown
│   ├── Navbar.tsx             # [MODIFY] Add LanguageSwitcher, translate strings
│   ├── PriceBreakdown.tsx     # [MODIFY] Translate labels
│   ├── MemberSearch.tsx       # [MODIFY] Translate placeholder/empty state
│   ├── Badge.tsx              # [MODIFY] Translate status labels
│   └── Spinner.tsx            # [MODIFY] Translate aria-label
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx      # [MODIFY] Translate all strings
│   │   └── RegisterPage.tsx   # [MODIFY] Translate all strings
│   └── customer/
│       ├── HomePage.tsx       # [MODIFY] Translate all strings
│       ├── BookingFlow.tsx    # [MODIFY] Translate all strings
│       └── BookingSuccessPage.tsx # [MODIFY] Translate all strings
├── App.tsx                    # [MODIFY] Add /:lang routing
└── main.tsx                   # [MODIFY] Init i18next
```

---

### Task 1: Install dependencies and create i18n config

**Files:**
- Create: `client/src/i18n/index.ts`
- Modify: `client/src/main.tsx`

- [ ] **Step 1: Install react-i18next and i18next**

Run:
```bash
cd /Users/bcmac/Desktop/projects/sporthub/client && npm install react-i18next i18next
```

- [ ] **Step 2: Create i18n config file**

Create `client/src/i18n/index.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import vi from './locales/vi.json';
import ru from './locales/ru.json';

export const SUPPORTED_LANGS = ['en', 'ko', 'ja', 'vi', 'ru'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const LANG_LABELS: Record<SupportedLang, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  vi: 'Tiếng Việt',
  ru: 'Русский',
};

export const LANG_FLAGS: Record<SupportedLang, string> = {
  en: '🇺🇸',
  ko: '🇰🇷',
  ja: '🇯🇵',
  vi: '🇻🇳',
  ru: '🇷🇺',
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
    ja: { translation: ja },
    vi: { translation: vi },
    ru: { translation: ru },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

- [ ] **Step 3: Import i18n in main.tsx**

In `client/src/main.tsx`, add this import before the App import:

```typescript
import './i18n';
```

The full file becomes:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 4: Commit**

```bash
git add client/src/i18n/index.ts client/src/main.tsx client/package.json client/package-lock.json
git commit -m "feat: add i18next config and initialization"
```

---

### Task 2: Create English translation file (default)

**Files:**
- Create: `client/src/i18n/locales/en.json`

- [ ] **Step 1: Create en.json with all customer-facing strings**

Create `client/src/i18n/locales/en.json`:

```json
{
  "nav": {
    "home": "Home",
    "bookNow": "Book Now",
    "login": "Login",
    "logout": "Logout",
    "dashboard": "Dashboard"
  },
  "auth": {
    "platformTagline": "Professional Court Booking Platform",
    "journeyTagline": "Start your journey to conquer the court",
    "loginTitle": "Login",
    "loginSubtitle": "Welcome back to the court!",
    "registerTitle": "Register",
    "registerSubtitle": "Create an account to get started.",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm",
    "name": "Full Name",
    "phone": "Phone Number",
    "forgotPassword": "Forgot password?",
    "loginButton": "Get Started",
    "authenticating": "Authenticating...",
    "registerButton": "Register Now",
    "processing": "Processing...",
    "noAccount": "Don't have an account?",
    "registerLink": "Register now",
    "hasAccount": "Already have an account?",
    "loginLink": "Login",
    "loginFailed": "Login failed. Please check your credentials.",
    "registerFailed": "Registration failed. Please try again.",
    "passwordMismatch": "Passwords do not match.",
    "termsAgreement": "By registering, you agree to SportHub's Terms and Policies.",
    "namePlaceholder": "e.g. John Doe",
    "phonePlaceholder": "09xx xxx xxx (Optional)",
    "copyright": "© 2026 SportHub Platform. Protected System."
  },
  "home": {
    "heroBadge": "Ready for the next match",
    "heroTitle": "CONQUER",
    "heroTitleHighlight": "EVERY COURT",
    "heroDescription": "Professional court booking for Tennis, Pickleball & Badminton. Fast experience, secure payment.",
    "courtsAvailable": "COURTS AVAILABLE",
    "searchButton": "Find Court",
    "hoursPlay": "hours of play",
    "readyTitle": "Ready to start?",
    "readySubtitle": "Choose a sport and time to find the best court.",
    "searching": "Searching for available courts...",
    "errorMessage": "An error occurred. Please try again later.",
    "noResultsTitle": "No courts available!",
    "noResultsMessage": "We couldn't find any courts matching your criteria. Try changing the time or date.",
    "backToSearch": "Back to search",
    "resultsTitle": "Search",
    "resultsHighlight": "Results",
    "courtsFound": "Found {{count}} matching courts",
    "courtStatus": {
      "active": "Available",
      "inactive": "Unavailable"
    },
    "priceNormal": "Standard",
    "pricePeak": "Peak Price",
    "peakHours": "Peak Hours",
    "perHour": "VND/hr",
    "bookNow": "Book Now",
    "footerDescription": "Leading sports court management and booking platform. Connecting the sports community.",
    "footerCopyright": "© 2026 SportHub Platform. All Rights Reserved."
  },
  "booking": {
    "title": "BOOK",
    "titleHighlight": "NOW",
    "subtitle": "Complete the steps to confirm your booking",
    "steps": {
      "courtInfo": "Court Info",
      "yourInfo": "Your Info",
      "confirm": "Confirm"
    },
    "courtSchedule": "Court Info & Schedule",
    "date": "Match Date",
    "startTime": "Start Time",
    "suggestedSlots": "Suggested Time Slots",
    "duration": "Duration",
    "continue": "Continue",
    "back": "Back",
    "review": "Review",
    "customerInfo": "Customer Information",
    "fullName": "Full Name",
    "phoneNumber": "Phone Number",
    "emailOptional": "Email (Optional)",
    "memberBenefits": "Member Benefits",
    "memberSearchPlaceholder": "Enter phone or email for discounts...",
    "additionalNotes": "Additional Notes",
    "notesPlaceholder": "e.g. Need extra rackets, buy drinks...",
    "discount": "DISCOUNT",
    "credit": "CREDIT",
    "confirmBooking": "Confirm Booking",
    "confirmTitle": "Confirm Your Booking",
    "courtDetails": "Court Details",
    "court": "Court",
    "time": "Time",
    "dateLabel": "Date",
    "timeType": "Time Type",
    "peakTime": "Peak Time",
    "normalTime": "Normal Time",
    "bookerInfo": "Booker Info",
    "nameLabel": "Name",
    "phoneLabel": "Phone",
    "emailLabel": "Email",
    "noteLabel": "Note",
    "total": "Total",
    "basePrice": "Base Price",
    "memberDiscount": "Member Discount",
    "creditUsed": "Credit Used",
    "submitting": "Processing...",
    "normalPrice": "Standard",
    "peakPrice": "Peak",
    "bookingFailed": "Booking failed. Please try again."
  },
  "bookingSuccess": {
    "title": "BOOKING",
    "titleHighlight": "SUCCESSFUL!",
    "message": "Your court has been reserved. Enjoy your game!",
    "bookingRef": "Your Booking Reference",
    "saveRef": "Please save this code for check-in",
    "guidelinesTitle": "What to note?",
    "guideline1": "Your booking is awaiting final staff confirmation",
    "guideline2": "Please arrive 10 minutes before your match time",
    "guideline3": "Show your booking code at the reception desk",
    "bookAnother": "Book Another Court",
    "goHome": "Go Home"
  },
  "common": {
    "loading": "Loading",
    "currency": "VND",
    "noMemberFound": "No member found"
  },
  "price": {
    "title": "Price Breakdown",
    "base": "Base price",
    "discount": "Discount",
    "creditUsed": "Credit used",
    "total": "Total"
  },
  "badge": {
    "pending": "Pending",
    "confirmed": "Confirmed",
    "cancelled": "Cancelled",
    "completed": "Completed",
    "rejected": "Rejected",
    "active": "Active",
    "inactive": "Inactive"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/i18n/locales/en.json
git commit -m "feat: add English translation file"
```

---

### Task 3: Create Korean, Japanese, Vietnamese, Russian translation files

**Files:**
- Create: `client/src/i18n/locales/ko.json`
- Create: `client/src/i18n/locales/ja.json`
- Create: `client/src/i18n/locales/vi.json`
- Create: `client/src/i18n/locales/ru.json`

- [ ] **Step 1: Create ko.json**

Create `client/src/i18n/locales/ko.json`:

```json
{
  "nav": {
    "home": "홈",
    "bookNow": "지금 예약",
    "login": "로그인",
    "logout": "로그아웃",
    "dashboard": "대시보드"
  },
  "auth": {
    "platformTagline": "전문 코트 예약 플랫폼",
    "journeyTagline": "코트 정복 여정을 시작하세요",
    "loginTitle": "로그인",
    "loginSubtitle": "코트에 다시 오신 것을 환영합니다!",
    "registerTitle": "회원가입",
    "registerSubtitle": "계정을 만들어 서비스를 시작하세요.",
    "email": "이메일",
    "password": "비밀번호",
    "confirmPassword": "비밀번호 확인",
    "name": "이름",
    "phone": "전화번호",
    "forgotPassword": "비밀번호를 잊으셨나요?",
    "loginButton": "시작하기",
    "authenticating": "인증 중...",
    "registerButton": "지금 가입",
    "processing": "처리 중...",
    "noAccount": "계정이 없으신가요?",
    "registerLink": "지금 가입",
    "hasAccount": "이미 계정이 있으신가요?",
    "loginLink": "로그인",
    "loginFailed": "로그인 실패. 자격 증명을 확인하세요.",
    "registerFailed": "가입 실패. 다시 시도하세요.",
    "passwordMismatch": "비밀번호가 일치하지 않습니다.",
    "termsAgreement": "가입하면 SportHub의 이용약관 및 정책에 동의합니다.",
    "namePlaceholder": "예: 홍길동",
    "phonePlaceholder": "09xx xxx xxx (선택 사항)",
    "copyright": "© 2026 SportHub Platform. Protected System."
  },
  "home": {
    "heroBadge": "다음 경기를 준비하세요",
    "heroTitle": "모든 코트를",
    "heroTitleHighlight": "정복하세요",
    "heroDescription": "테니스, 피클볼 & 배드민턴을 위한 전문 코트 예약. 빠른 경험, 안전한 결제.",
    "courtsAvailable": "예약 가능한 코트",
    "searchButton": "코트 찾기",
    "hoursPlay": "시간 경기",
    "readyTitle": "시작할 준비가 되셨나요?",
    "readySubtitle": "스포츠와 시간을 선택하여 최적의 코트를 찾으세요.",
    "searching": "가능한 코트를 검색 중...",
    "errorMessage": "오류가 발생했습니다. 나중에 다시 시도하세요.",
    "noResultsTitle": "가능한 코트가 없습니다!",
    "noResultsMessage": "조건에 맞는 코트를 찾을 수 없습니다. 시간이나 날짜를 변경해 보세요.",
    "backToSearch": "검색으로 돌아가기",
    "resultsTitle": "검색",
    "resultsHighlight": "결과",
    "courtsFound": "{{count}}개의 코트를 찾았습니다",
    "courtStatus": {
      "active": "이용 가능",
      "inactive": "이용 불가"
    },
    "priceNormal": "일반가",
    "pricePeak": "피크 가격",
    "peakHours": "피크 시간",
    "perHour": "원/시간",
    "bookNow": "지금 예약",
    "footerDescription": "최고의 스포츠 코트 관리 및 예약 플랫폼. 스포츠 커뮤니티를 연결합니다.",
    "footerCopyright": "© 2026 SportHub Platform. All Rights Reserved."
  },
  "booking": {
    "title": "지금",
    "titleHighlight": "예약",
    "subtitle": "예약을 확인하려면 단계를 완료하세요",
    "steps": {
      "courtInfo": "코트 정보",
      "yourInfo": "개인 정보",
      "confirm": "확인"
    },
    "courtSchedule": "코트 정보 & 일정",
    "date": "경기 날짜",
    "startTime": "시작 시간",
    "suggestedSlots": "추천 시간대",
    "duration": "시간",
    "continue": "계속",
    "back": "뒤로",
    "review": "검토",
    "customerInfo": "고객 정보",
    "fullName": "이름",
    "phoneNumber": "전화번호",
    "emailOptional": "이메일 (선택 사항)",
    "memberBenefits": "회원 혜택",
    "memberSearchPlaceholder": "할인을 위해 전화번호 또는 이메일을 입력하세요...",
    "additionalNotes": "추가 메모",
    "notesPlaceholder": "예: 추가 라켓 필요, 음료 구매...",
    "discount": "할인",
    "credit": "크레딧",
    "confirmBooking": "예약 확인",
    "confirmTitle": "예약 확인",
    "courtDetails": "코트 상세",
    "court": "코트",
    "time": "시간",
    "dateLabel": "날짜",
    "timeType": "시간 유형",
    "peakTime": "피크 시간",
    "normalTime": "일반 시간",
    "bookerInfo": "예약자 정보",
    "nameLabel": "이름",
    "phoneLabel": "전화번호",
    "emailLabel": "이메일",
    "noteLabel": "메모",
    "total": "합계",
    "basePrice": "기본 가격",
    "memberDiscount": "회원 할인",
    "creditUsed": "사용된 크레딧",
    "submitting": "처리 중...",
    "normalPrice": "일반",
    "peakPrice": "피크",
    "bookingFailed": "예약 실패. 다시 시도하세요."
  },
  "bookingSuccess": {
    "title": "예약",
    "titleHighlight": "성공!",
    "message": "코트가 예약되었습니다. 좋은 경기 되세요!",
    "bookingRef": "예약 번호",
    "saveRef": "체크인을 위해 이 코드를 저장하세요",
    "guidelinesTitle": "알아두세요",
    "guideline1": "예약이 직원의 최종 확인을 기다리고 있습니다",
    "guideline2": "경기 시간 10분 전에 도착해 주세요",
    "guideline3": "리셉션에서 예약 코드를 제시해 주세요",
    "bookAnother": "다른 코트 예약",
    "goHome": "홈으로"
  },
  "common": {
    "loading": "로딩 중",
    "currency": "VND",
    "noMemberFound": "회원을 찾을 수 없습니다"
  },
  "price": {
    "title": "가격 내역",
    "base": "기본 가격",
    "discount": "할인",
    "creditUsed": "사용된 크레딧",
    "total": "합계"
  },
  "badge": {
    "pending": "대기 중",
    "confirmed": "확인됨",
    "cancelled": "취소됨",
    "completed": "완료됨",
    "rejected": "거부됨",
    "active": "활성",
    "inactive": "비활성"
  }
}
```

- [ ] **Step 2: Create ja.json**

Create `client/src/i18n/locales/ja.json`:

```json
{
  "nav": {
    "home": "ホーム",
    "bookNow": "今すぐ予約",
    "login": "ログイン",
    "logout": "ログアウト",
    "dashboard": "ダッシュボード"
  },
  "auth": {
    "platformTagline": "プロフェッショナルコート予約プラットフォーム",
    "journeyTagline": "コート制覇の旅を始めましょう",
    "loginTitle": "ログイン",
    "loginSubtitle": "コートへお帰りなさい！",
    "registerTitle": "会員登録",
    "registerSubtitle": "アカウントを作成してサービスを始めましょう。",
    "email": "メールアドレス",
    "password": "パスワード",
    "confirmPassword": "パスワード確認",
    "name": "氏名",
    "phone": "電話番号",
    "forgotPassword": "パスワードをお忘れですか？",
    "loginButton": "始める",
    "authenticating": "認証中...",
    "registerButton": "今すぐ登録",
    "processing": "処理中...",
    "noAccount": "アカウントをお持ちでないですか？",
    "registerLink": "今すぐ登録",
    "hasAccount": "すでにアカウントをお持ちですか？",
    "loginLink": "ログイン",
    "loginFailed": "ログインに失敗しました。資格情報を確認してください。",
    "registerFailed": "登録に失敗しました。もう一度お試しください。",
    "passwordMismatch": "パスワードが一致しません。",
    "termsAgreement": "登録することで、SportHubの利用規約とポリシーに同意します。",
    "namePlaceholder": "例：田中太郎",
    "phonePlaceholder": "09xx xxx xxx（任意）",
    "copyright": "© 2026 SportHub Platform. Protected System."
  },
  "home": {
    "heroBadge": "次の試合の準備をしましょう",
    "heroTitle": "すべてのコートを",
    "heroTitleHighlight": "制覇しよう",
    "heroDescription": "テニス、ピックルボール＆バドミントンのプロフェッショナル予約。迅速な体験、安全な支払い。",
    "courtsAvailable": "利用可能なコート",
    "searchButton": "コートを探す",
    "hoursPlay": "時間プレー",
    "readyTitle": "始める準備はできましたか？",
    "readySubtitle": "スポーツと時間を選んで最適なコートを見つけましょう。",
    "searching": "空きコートを検索中...",
    "errorMessage": "エラーが発生しました。後でもう一度お試しください。",
    "noResultsTitle": "空きコートがありません！",
    "noResultsMessage": "条件に合うコートが見つかりませんでした。時間や日付を変更してみてください。",
    "backToSearch": "検索に戻る",
    "resultsTitle": "検索",
    "resultsHighlight": "結果",
    "courtsFound": "{{count}}件のコートが見つかりました",
    "courtStatus": {
      "active": "利用可能",
      "inactive": "利用不可"
    },
    "priceNormal": "通常料金",
    "pricePeak": "ピーク料金",
    "peakHours": "ピーク時間",
    "perHour": "円/時間",
    "bookNow": "今すぐ予約",
    "footerDescription": "トップクラスのスポーツコート管理・予約プラットフォーム。スポーツコミュニティをつなぎます。",
    "footerCopyright": "© 2026 SportHub Platform. All Rights Reserved."
  },
  "booking": {
    "title": "今すぐ",
    "titleHighlight": "予約",
    "subtitle": "予約を確定するには手順を完了してください",
    "steps": {
      "courtInfo": "コート情報",
      "yourInfo": "お客様情報",
      "confirm": "確認"
    },
    "courtSchedule": "コート情報＆スケジュール",
    "date": "試合日",
    "startTime": "開始時間",
    "suggestedSlots": "おすすめ時間帯",
    "duration": "時間",
    "continue": "次へ",
    "back": "戻る",
    "review": "確認する",
    "customerInfo": "お客様情報",
    "fullName": "氏名",
    "phoneNumber": "電話番号",
    "emailOptional": "メール（任意）",
    "memberBenefits": "会員特典",
    "memberSearchPlaceholder": "割引を受けるには電話番号またはメールを入力...",
    "additionalNotes": "追加メモ",
    "notesPlaceholder": "例：追加ラケットが必要、飲み物を購入...",
    "discount": "割引",
    "credit": "クレジット",
    "confirmBooking": "予約を確定",
    "confirmTitle": "予約の確認",
    "courtDetails": "コート詳細",
    "court": "コート",
    "time": "時間",
    "dateLabel": "日付",
    "timeType": "時間タイプ",
    "peakTime": "ピーク時間",
    "normalTime": "通常時間",
    "bookerInfo": "予約者情報",
    "nameLabel": "名前",
    "phoneLabel": "電話番号",
    "emailLabel": "メール",
    "noteLabel": "メモ",
    "total": "合計",
    "basePrice": "基本料金",
    "memberDiscount": "会員割引",
    "creditUsed": "使用クレジット",
    "submitting": "処理中...",
    "normalPrice": "通常",
    "peakPrice": "ピーク",
    "bookingFailed": "予約に失敗しました。もう一度お試しください。"
  },
  "bookingSuccess": {
    "title": "予約",
    "titleHighlight": "成功！",
    "message": "コートが予約されました。良い試合を！",
    "bookingRef": "予約番号",
    "saveRef": "チェックインのためにこのコードを保存してください",
    "guidelinesTitle": "ご注意ください",
    "guideline1": "予約はスタッフの最終確認を待っています",
    "guideline2": "試合時間の10分前にお越しください",
    "guideline3": "受付で予約コードをご提示ください",
    "bookAnother": "別のコートを予約",
    "goHome": "ホームへ"
  },
  "common": {
    "loading": "読み込み中",
    "currency": "VND",
    "noMemberFound": "メンバーが見つかりません"
  },
  "price": {
    "title": "料金内訳",
    "base": "基本料金",
    "discount": "割引",
    "creditUsed": "使用クレジット",
    "total": "合計"
  },
  "badge": {
    "pending": "保留中",
    "confirmed": "確認済み",
    "cancelled": "キャンセル",
    "completed": "完了",
    "rejected": "拒否",
    "active": "アクティブ",
    "inactive": "非アクティブ"
  }
}
```

- [ ] **Step 3: Create vi.json**

Create `client/src/i18n/locales/vi.json`:

```json
{
  "nav": {
    "home": "Trang chủ",
    "bookNow": "Đặt sân ngay",
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "dashboard": "Dashboard"
  },
  "auth": {
    "platformTagline": "Nền tảng đặt sân chuyên nghiệp",
    "journeyTagline": "Bắt đầu hành trình chinh phục sân đấu",
    "loginTitle": "Đăng nhập",
    "loginSubtitle": "Chào mừng bạn quay trở lại sân đấu!",
    "registerTitle": "Đăng ký",
    "registerSubtitle": "Tạo tài khoản để bắt đầu trải nghiệm dịch vụ.",
    "email": "Email",
    "password": "Mật khẩu",
    "confirmPassword": "Xác nhận",
    "name": "Họ và tên",
    "phone": "Số điện thoại",
    "forgotPassword": "Quên mật khẩu?",
    "loginButton": "Bắt đầu ngay",
    "authenticating": "Đang xác thực...",
    "registerButton": "Đăng ký ngay",
    "processing": "Đang xử lý...",
    "noAccount": "Chưa có tài khoản?",
    "registerLink": "Đăng ký ngay",
    "hasAccount": "Đã có tài khoản?",
    "loginLink": "Đăng nhập",
    "loginFailed": "Đăng nhập thất bại. Vui lòng kiểm tra lại.",
    "registerFailed": "Đăng ký thất bại. Vui lòng thử lại.",
    "passwordMismatch": "Mật khẩu xác nhận không khớp.",
    "termsAgreement": "Bằng việc đăng ký, bạn đồng ý với các Điều khoản và Chính sách của SportHub.",
    "namePlaceholder": "VD: Nguyễn Văn A",
    "phonePlaceholder": "09xx xxx xxx (Tùy chọn)",
    "copyright": "© 2026 SportHub Platform. Protected System."
  },
  "home": {
    "heroBadge": "Sẵn sàng cho trận đấu tiếp theo",
    "heroTitle": "CHINH PHỤC",
    "heroTitleHighlight": "MỌI SÂN ĐẤU",
    "heroDescription": "Hệ thống đặt sân chuyên nghiệp cho Tennis, Pickleball & Badminton. Trải nghiệm nhanh chóng, thanh toán an toàn.",
    "courtsAvailable": "SÂN CÓ SẴN",
    "searchButton": "Tìm sân ngay",
    "hoursPlay": "giờ thi đấu",
    "readyTitle": "Sẵn sàng để bắt đầu?",
    "readySubtitle": "Chọn môn thể thao và thời gian để tìm sân phù hợp nhất.",
    "searching": "Đang tìm kiếm sân trống...",
    "errorMessage": "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
    "noResultsTitle": "Hết sân trống rồi!",
    "noResultsMessage": "Chúng tôi không tìm thấy sân nào phù hợp với yêu cầu của bạn. Thử thay đổi thời gian hoặc ngày xem sao nhé.",
    "backToSearch": "Quay lại tìm kiếm",
    "resultsTitle": "Kết quả",
    "resultsHighlight": "tìm kiếm",
    "courtsFound": "Tìm thấy {{count}} sân phù hợp",
    "courtStatus": {
      "active": "Sẵn sàng",
      "inactive": "Không khả dụng"
    },
    "priceNormal": "Giá thường",
    "pricePeak": "Giá Peak",
    "peakHours": "Khung giờ Peak",
    "perHour": "VND/giờ",
    "bookNow": "Đặt ngay",
    "footerDescription": "Nền tảng quản lý và đặt sân thể thao hàng đầu. Kết nối cộng đồng đam mê vận động.",
    "footerCopyright": "© 2026 SportHub Platform. All Rights Reserved."
  },
  "booking": {
    "title": "ĐẶT SÂN",
    "titleHighlight": "NGAY",
    "subtitle": "Hoàn thành các bước để xác nhận lịch đặt của bạn",
    "steps": {
      "courtInfo": "Thông tin sân",
      "yourInfo": "Thông tin của bạn",
      "confirm": "Xác nhận"
    },
    "courtSchedule": "Thông tin sân & Lịch đặt",
    "date": "Ngày thi đấu",
    "startTime": "Giờ bắt đầu",
    "suggestedSlots": "Khung giờ gợi ý",
    "duration": "Thời lượng",
    "continue": "Tiếp tục",
    "back": "Quay lại",
    "review": "Kiểm tra lại",
    "customerInfo": "Thông tin khách hàng",
    "fullName": "Họ và tên",
    "phoneNumber": "Số điện thoại",
    "emailOptional": "Email (không bắt buộc)",
    "memberBenefits": "Ưu đãi thành viên",
    "memberSearchPlaceholder": "Nhập SĐT hoặc email để hưởng ưu đãi...",
    "additionalNotes": "Ghi chú thêm",
    "notesPlaceholder": "VD: Cần thuê thêm vợt, mua nước...",
    "discount": "GIẢM GIÁ",
    "credit": "CREDIT",
    "confirmBooking": "Xác nhận đặt sân",
    "confirmTitle": "Xác nhận lịch đặt",
    "courtDetails": "Chi tiết sân",
    "court": "Sân",
    "time": "Thời gian",
    "dateLabel": "Ngày",
    "timeType": "Loại giờ",
    "peakTime": "Giờ cao điểm",
    "normalTime": "Giờ thường",
    "bookerInfo": "Người đặt",
    "nameLabel": "Tên",
    "phoneLabel": "SĐT",
    "emailLabel": "Email",
    "noteLabel": "Ghi chú",
    "total": "Tổng cộng",
    "basePrice": "Giá gốc",
    "memberDiscount": "Ưu đãi thành viên",
    "creditUsed": "Credit đã dùng",
    "submitting": "Đang xử lý...",
    "normalPrice": "Thường",
    "peakPrice": "Peak",
    "bookingFailed": "Đặt sân thất bại. Vui lòng thử lại."
  },
  "bookingSuccess": {
    "title": "ĐẶT SÂN",
    "titleHighlight": "THÀNH CÔNG!",
    "message": "Sân của bạn đã được giữ chỗ. Chúc bạn có một trận đấu tuyệt vời!",
    "bookingRef": "Mã đặt sân của bạn",
    "saveRef": "Vui lòng lưu lại mã này để check-in",
    "guidelinesTitle": "Cần lưu ý điều gì?",
    "guideline1": "Lịch đặt đang chờ nhân viên xác nhận cuối cùng",
    "guideline2": "Vui lòng đến sớm 10 phút trước giờ thi đấu",
    "guideline3": "Xuất trình mã đặt sân tại quầy lễ tân",
    "bookAnother": "Đặt thêm sân khác",
    "goHome": "Về trang chủ"
  },
  "common": {
    "loading": "Đang tải",
    "currency": "VND",
    "noMemberFound": "Không tìm thấy thành viên"
  },
  "price": {
    "title": "Chi tiết giá",
    "base": "Giá gốc",
    "discount": "Giảm giá",
    "creditUsed": "Credit đã dùng",
    "total": "Tổng cộng"
  },
  "badge": {
    "pending": "Chờ xử lý",
    "confirmed": "Đã xác nhận",
    "cancelled": "Đã hủy",
    "completed": "Hoàn thành",
    "rejected": "Từ chối",
    "active": "Hoạt động",
    "inactive": "Không hoạt động"
  }
}
```

- [ ] **Step 4: Create ru.json**

Create `client/src/i18n/locales/ru.json`:

```json
{
  "nav": {
    "home": "Главная",
    "bookNow": "Забронировать",
    "login": "Войти",
    "logout": "Выйти",
    "dashboard": "Панель"
  },
  "auth": {
    "platformTagline": "Профессиональная платформа бронирования кортов",
    "journeyTagline": "Начните свой путь к покорению корта",
    "loginTitle": "Вход",
    "loginSubtitle": "С возвращением на корт!",
    "registerTitle": "Регистрация",
    "registerSubtitle": "Создайте аккаунт, чтобы начать.",
    "email": "Эл. почта",
    "password": "Пароль",
    "confirmPassword": "Подтверждение",
    "name": "Полное имя",
    "phone": "Телефон",
    "forgotPassword": "Забыли пароль?",
    "loginButton": "Начать",
    "authenticating": "Авторизация...",
    "registerButton": "Зарегистрироваться",
    "processing": "Обработка...",
    "noAccount": "Нет аккаунта?",
    "registerLink": "Зарегистрируйтесь",
    "hasAccount": "Уже есть аккаунт?",
    "loginLink": "Войти",
    "loginFailed": "Не удалось войти. Проверьте данные.",
    "registerFailed": "Регистрация не удалась. Попробуйте снова.",
    "passwordMismatch": "Пароли не совпадают.",
    "termsAgreement": "Регистрируясь, вы соглашаетесь с Условиями и Политикой SportHub.",
    "namePlaceholder": "напр. Иванов Иван",
    "phonePlaceholder": "09xx xxx xxx (Необязательно)",
    "copyright": "© 2026 SportHub Platform. Protected System."
  },
  "home": {
    "heroBadge": "Готовы к следующему матчу",
    "heroTitle": "ПОКОРЯЙТЕ",
    "heroTitleHighlight": "КАЖДЫЙ КОРТ",
    "heroDescription": "Профессиональное бронирование кортов для тенниса, пиклбола и бадминтона. Быстрый сервис, безопасная оплата.",
    "courtsAvailable": "ДОСТУПНЫХ КОРТОВ",
    "searchButton": "Найти корт",
    "hoursPlay": "часов игры",
    "readyTitle": "Готовы начать?",
    "readySubtitle": "Выберите спорт и время, чтобы найти лучший корт.",
    "searching": "Поиск свободных кортов...",
    "errorMessage": "Произошла ошибка. Попробуйте позже.",
    "noResultsTitle": "Нет свободных кортов!",
    "noResultsMessage": "Мы не нашли кортов по вашим критериям. Попробуйте изменить время или дату.",
    "backToSearch": "Вернуться к поиску",
    "resultsTitle": "Результаты",
    "resultsHighlight": "поиска",
    "courtsFound": "Найдено {{count}} кортов",
    "courtStatus": {
      "active": "Доступен",
      "inactive": "Недоступен"
    },
    "priceNormal": "Обычная цена",
    "pricePeak": "Пиковая цена",
    "peakHours": "Пиковые часы",
    "perHour": "VND/час",
    "bookNow": "Забронировать",
    "footerDescription": "Ведущая платформа управления и бронирования спортивных кортов. Объединяем спортивное сообщество.",
    "footerCopyright": "© 2026 SportHub Platform. All Rights Reserved."
  },
  "booking": {
    "title": "ЗАБРОНИРОВАТЬ",
    "titleHighlight": "СЕЙЧАС",
    "subtitle": "Выполните шаги для подтверждения бронирования",
    "steps": {
      "courtInfo": "Информация о корте",
      "yourInfo": "Ваши данные",
      "confirm": "Подтверждение"
    },
    "courtSchedule": "Информация о корте и расписание",
    "date": "Дата матча",
    "startTime": "Время начала",
    "suggestedSlots": "Рекомендуемое время",
    "duration": "Продолжительность",
    "continue": "Продолжить",
    "back": "Назад",
    "review": "Проверить",
    "customerInfo": "Информация о клиенте",
    "fullName": "Полное имя",
    "phoneNumber": "Телефон",
    "emailOptional": "Эл. почта (необязательно)",
    "memberBenefits": "Привилегии участника",
    "memberSearchPlaceholder": "Введите телефон или email для скидки...",
    "additionalNotes": "Дополнительные заметки",
    "notesPlaceholder": "напр. Нужны дополнительные ракетки, напитки...",
    "discount": "СКИДКА",
    "credit": "КРЕДИТ",
    "confirmBooking": "Подтвердить бронирование",
    "confirmTitle": "Подтверждение бронирования",
    "courtDetails": "Детали корта",
    "court": "Корт",
    "time": "Время",
    "dateLabel": "Дата",
    "timeType": "Тип времени",
    "peakTime": "Пиковое время",
    "normalTime": "Обычное время",
    "bookerInfo": "Данные клиента",
    "nameLabel": "Имя",
    "phoneLabel": "Телефон",
    "emailLabel": "Эл. почта",
    "noteLabel": "Заметка",
    "total": "Итого",
    "basePrice": "Базовая цена",
    "memberDiscount": "Скидка участника",
    "creditUsed": "Использованный кредит",
    "submitting": "Обработка...",
    "normalPrice": "Обычная",
    "peakPrice": "Пиковая",
    "bookingFailed": "Бронирование не удалось. Попробуйте снова."
  },
  "bookingSuccess": {
    "title": "БРОНИРОВАНИЕ",
    "titleHighlight": "УСПЕШНО!",
    "message": "Ваш корт забронирован. Удачной игры!",
    "bookingRef": "Номер бронирования",
    "saveRef": "Сохраните этот код для регистрации",
    "guidelinesTitle": "Обратите внимание",
    "guideline1": "Бронирование ожидает окончательного подтверждения персонала",
    "guideline2": "Пожалуйста, приходите за 10 минут до начала матча",
    "guideline3": "Предъявите код бронирования на ресепшене",
    "bookAnother": "Забронировать ещё",
    "goHome": "На главную"
  },
  "common": {
    "loading": "Загрузка",
    "currency": "VND",
    "noMemberFound": "Участник не найден"
  },
  "price": {
    "title": "Детали цены",
    "base": "Базовая цена",
    "discount": "Скидка",
    "creditUsed": "Использованный кредит",
    "total": "Итого"
  },
  "badge": {
    "pending": "Ожидание",
    "confirmed": "Подтверждено",
    "cancelled": "Отменено",
    "completed": "Завершено",
    "rejected": "Отклонено",
    "active": "Активно",
    "inactive": "Неактивно"
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add client/src/i18n/locales/
git commit -m "feat: add KO, JA, VI, RU translation files"
```

---

### Task 4: Create LanguageSwitcher component

**Files:**
- Create: `client/src/components/LanguageSwitcher.tsx`

- [ ] **Step 1: Create LanguageSwitcher component**

Create `client/src/components/LanguageSwitcher.tsx`:

```tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGS, LANG_LABELS, LANG_FLAGS, type SupportedLang } from '../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = (lang as SupportedLang) || (i18n.language as SupportedLang) || 'en';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newLang: SupportedLang) => {
    setOpen(false);
    i18n.changeLanguage(newLang);

    // Replace the lang prefix in the current path
    const pathWithoutLang = location.pathname.replace(/^\/(en|ko|ja|vi|ru)/, '') || '/';
    navigate(`/${newLang}${pathWithoutLang}${location.search}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm"
      >
        <Globe size={16} />
        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
          {LANG_FLAGS[currentLang]} {currentLang.toUpperCase()}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {SUPPORTED_LANGS.map((code) => (
            <button
              key={code}
              onClick={() => handleSelect(code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                currentLang === code
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-base">{LANG_FLAGS[code]}</span>
              <span className="font-medium">{LANG_LABELS[code]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/LanguageSwitcher.tsx
git commit -m "feat: add LanguageSwitcher component"
```

---

### Task 5: Update App.tsx routing with /:lang prefix

**Files:**
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Update App.tsx with language-prefixed routes**

Replace the entire content of `client/src/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import { SUPPORTED_LANGS, type SupportedLang } from './i18n';

// Customer pages
import HomePage from './pages/customer/HomePage';
import BookingFlow from './pages/customer/BookingFlow';
import BookingSuccessPage from './pages/customer/BookingSuccessPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminBookingsPage from './pages/admin/BookingsPage';
import AdminBookPage from './pages/admin/AdminBookPage';
import AdminMembersPage from './pages/admin/MembersPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminOrdersPage from './pages/admin/OrdersPage';

function LangSync({ children }: { children: React.ReactNode }) {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && SUPPORTED_LANGS.includes(lang as SupportedLang)) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /en */}
        <Route path="/" element={<Navigate to="/en" replace />} />

        {/* Language-prefixed customer routes */}
        <Route path="/:lang" element={<LangSync><HomePage /></LangSync>} />
        <Route path="/:lang/book" element={<LangSync><BookingFlow /></LangSync>} />
        <Route path="/:lang/booking/success" element={<LangSync><BookingSuccessPage /></LangSync>} />
        <Route path="/:lang/login" element={<LangSync><LoginPage /></LangSync>} />
        <Route path="/:lang/register" element={<LangSync><RegisterPage /></LangSync>} />

        {/* Admin routes (no lang prefix) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="staff">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="book" element={<AdminBookPage />} />
          <Route path="members" element={<AdminMembersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
        </Route>

        {/* Catch-all: redirect to /en */}
        <Route path="*" element={<Navigate to="/en" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/App.tsx
git commit -m "feat: add language-prefixed routing with LangSync wrapper"
```

---

### Task 6: Update Navbar with LanguageSwitcher and translations

**Files:**
- Modify: `client/src/components/Navbar.tsx`

- [ ] **Step 1: Update Navbar.tsx**

Replace the entire content of `client/src/components/Navbar.tsx` with:

```tsx
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LogOut, LayoutDashboard, PlayCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { lang = 'en' } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(10, 10, 11, 0)', 'rgba(18, 18, 20, 0.8)']
  );
  
  const backdropBlur = useTransform(
    scrollY,
    [0, 50],
    ['blur(0px)', 'blur(12px)']
  );

  const borderBottom = useTransform(
    scrollY,
    [0, 50],
    ['1px solid rgba(255, 255, 255, 0)', '1px solid rgba(255, 255, 255, 0.05)']
  );

  const handleLogout = () => {
    logout();
    navigate(`/${lang}/login`);
  };

  return (
    <motion.nav 
      style={{ backgroundColor, backdropFilter: backdropBlur, borderBottom }}
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 transition-all"
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link to={`/${lang}`} className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-neon"
          >
            <PlayCircle className="w-6 h-6 text-background" />
          </motion.div>
          <span className="text-xl font-display font-bold text-white tracking-tight">
            SPORT<span className="text-primary">HUB</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to={`/${lang}`}
            className="text-gray-400 hover:text-primary text-sm font-semibold tracking-wide uppercase transition-colors"
          >
            {t('nav.home')}
          </Link>
          <Link
            to={`/${lang}/book`}
            className="text-gray-400 hover:text-primary text-sm font-semibold tracking-wide uppercase transition-colors"
          >
            {t('nav.bookNow')}
          </Link>
        </div>

        {/* Auth section + Language Switcher */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-white leading-none">
                  {user.name}
                </span>
                <span className="text-[10px] text-primary uppercase tracking-widest font-bold mt-1">
                  {user.role}
                </span>
              </div>
              
              {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'staff') && (
                <Link
                  to="/admin/dashboard"
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:border-primary/30 transition-all"
                  title={t('nav.dashboard')}
                >
                  <LayoutDashboard size={20} />
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-accent hover:border-accent/30 transition-all"
                title={t('nav.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              to={`/${lang}/login`}
              className="btn-primary"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/Navbar.tsx
git commit -m "feat: add LanguageSwitcher to Navbar and translate strings"
```

---

### Task 7: Translate LoginPage and RegisterPage

**Files:**
- Modify: `client/src/pages/auth/LoginPage.tsx`
- Modify: `client/src/pages/auth/RegisterPage.tsx`

- [ ] **Step 1: Update LoginPage.tsx**

Replace the entire content of `client/src/pages/auth/LoginPage.tsx` with:

```tsx
import { useState, type FormEvent } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ChevronRight, PlayCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth.store';
import Spinner from '../../components/Spinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { lang = 'en' } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      login(token, user);
      const adminRoles = ['admin', 'super_admin', 'staff'];
      if (adminRoles.includes(user.role)) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(`/${lang}`, { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="bg-shape shape-1 opacity-20" />
      <div className="bg-shape shape-2 opacity-10" />

      <div className="w-full max-w-[400px] relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <Link to={`/${lang}`} className="flex items-center gap-3 group mb-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-neon"
            >
              <PlayCircle className="w-8 h-8 text-background" />
            </motion.div>
            <span className="text-2xl font-display font-black text-white tracking-tight">
              SPORT<span className="text-primary italic">HUB</span>
            </span>
          </Link>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">{t('auth.platformTagline')}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap size={100} className="text-primary" />
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-2 uppercase tracking-tight">{t('auth.loginTitle')}</h2>
          <p className="text-xs text-gray-500 mb-8 font-medium">{t('auth.loginSubtitle')}</p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-bold"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="input-field pl-12 py-3.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('auth.password')}</label>
                <a href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">{t('auth.forgotPassword')}</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field pl-12 py-3.5"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 mt-4 shadow-neon group"
            >
              {loading ? (
                <>
                  <Spinner size={18} />
                  {t('auth.authenticating')}
                </>
              ) : (
                <>
                  {t('auth.loginButton')}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500 font-medium">
              {t('auth.noAccount')} <Link to={`/${lang}/register`} className="text-primary font-bold hover:underline">{t('auth.registerLink')}</Link>
            </p>
          </div>
        </motion.div>
        
        <p className="mt-12 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
          {t('auth.copyright')}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update RegisterPage.tsx**

Replace the entire content of `client/src/pages/auth/RegisterPage.tsx` with:

```tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Phone, ChevronRight, PlayCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth.store';
import Spinner from '../../components/Spinner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { lang = 'en' } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        ...(form.phone ? { phone: form.phone } : {}),
      };
      const { token, user } = await authApi.register(payload);
      login(token, user);
      navigate(`/${lang}`, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="bg-shape shape-1 opacity-20" />
      <div className="bg-shape shape-2 opacity-10" />

      <div className="w-full max-w-[440px] relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <Link to={`/${lang}`} className="flex items-center gap-3 group mb-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-neon"
            >
              <PlayCircle className="w-8 h-8 text-background" />
            </motion.div>
            <span className="text-2xl font-display font-black text-white tracking-tight">
              SPORT<span className="text-primary italic">HUB</span>
            </span>
          </Link>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">{t('auth.journeyTagline')}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap size={100} className="text-primary" />
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-2 uppercase tracking-tight">{t('auth.registerTitle')}</h2>
          <p className="text-xs text-gray-500 mb-8 font-medium">{t('auth.registerSubtitle')}</p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-bold flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{t('auth.name')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder={t('auth.namePlaceholder')}
                  className="input-field pl-12 py-3.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="input-field pl-12 py-3.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{t('auth.phone')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t('auth.phonePlaceholder')}
                  className="input-field pl-12 py-3.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{t('auth.password')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="input-field pl-12 py-3.5 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="input-field pl-12 py-3.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 mt-6 shadow-neon group"
            >
              {loading ? (
                <>
                  <Spinner size={18} />
                  {t('auth.processing')}
                </>
              ) : (
                <>
                  {t('auth.registerButton')}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500 font-medium">
              {t('auth.hasAccount')} <Link to={`/${lang}/login`} className="text-primary font-bold hover:underline">{t('auth.loginLink')}</Link>
            </p>
          </div>
        </motion.div>
        
        <p className="mt-12 text-center text-xs text-gray-600 font-medium px-8">
          {t('auth.termsAgreement')}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/auth/LoginPage.tsx client/src/pages/auth/RegisterPage.tsx
git commit -m "feat: translate LoginPage and RegisterPage"
```

---

### Task 8: Translate HomePage

**Files:**
- Modify: `client/src/pages/customer/HomePage.tsx`

- [ ] **Step 1: Update HomePage.tsx**

Key changes to make (the full file is large, so here are the specific string replacements):

1. Add imports at top:
```tsx
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';  // add useParams to existing import
```

2. In `CourtCard` component, add `lang` and `t` props and translate:
- Change the component signature to accept `lang` and `t` props
- `'Sẵn sàng'` → `t('home.courtStatus.active')`
- `'Giá thường'` → `t('home.priceNormal')`
- `'Giá Peak'` → `t('home.pricePeak')`
- `'Khung giờ Peak'` → `t('home.peakHours')`
- `'VND/giờ'` → `t('home.perHour')`
- `'Đặt ngay'` → `t('home.bookNow')`

3. In `HomePage` component:
- Add `const { t } = useTranslation();` and `const { lang = 'en' } = useParams<{ lang: string }>();`
- `'Sẵn sàng cho trận đấu tiếp theo'` → `t('home.heroBadge')`
- `'CHINH PHỤC'` → `t('home.heroTitle')`
- `'MỌI SÂN ĐẤU'` → `t('home.heroTitleHighlight')`
- The hero description → `t('home.heroDescription')`
- `'SÂN CÓ SẴN'` → `t('home.courtsAvailable')`
- `'giờ thi đấu'` → `t('home.hoursPlay')`
- `'Tìm sân ngay'` → `t('home.searchButton')`
- `'Sẵn sàng để bắt đầu?'` → `t('home.readyTitle')`
- `'Chọn môn thể thao...'` → `t('home.readySubtitle')`
- `'Đang tìm kiếm sân trống...'` → `t('home.searching')`
- `'Đã có lỗi xảy ra...'` → `t('home.errorMessage')`
- `'Hết sân trống rồi!'` → `t('home.noResultsTitle')`
- `'Chúng tôi không tìm thấy...'` → `t('home.noResultsMessage')`
- `'Quay lại tìm kiếm'` → `t('home.backToSearch')`
- `'Kết quả'` → `t('home.resultsTitle')`
- `'tìm kiếm'` → `t('home.resultsHighlight')`
- `Tìm thấy {courts.length} sân phù hợp` → `t('home.courtsFound', { count: courts.length })`
- Update `handleBook` to navigate to `/${lang}/book?${params.toString()}`
- Update footer strings similarly
- All internal `Link` `to` props: prefix with `/${lang}`

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/customer/HomePage.tsx
git commit -m "feat: translate HomePage"
```

---

### Task 9: Translate BookingFlow

**Files:**
- Modify: `client/src/pages/customer/BookingFlow.tsx`

- [ ] **Step 1: Update BookingFlow.tsx**

Key changes:

1. Add imports:
```tsx
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom'; // add useParams to existing import
```

2. Replace `STEPS` array with translation keys:
```tsx
// Remove: const STEPS = ['Thông tin sân', 'Thông tin của bạn', 'Xác nhận'];
// In StepIndicator, accept t prop and use:
const STEP_KEYS = ['booking.steps.courtInfo', 'booking.steps.yourInfo', 'booking.steps.confirm'];
```

3. In `BookingFlow` component:
- Add `const { t } = useTranslation();` and `const { lang = 'en' } = useParams<{ lang: string }>();`
- `'ĐẶT SÂN'` → `t('booking.title')`
- `'NGAY'` → `t('booking.titleHighlight')`
- `'Hoàn thành các bước...'` → `t('booking.subtitle')`
- `'Thông tin sân & Lịch đặt'` → `t('booking.courtSchedule')`
- `'Ngày thi đấu'` → `t('booking.date')`
- `'Giờ bắt đầu'` → `t('booking.startTime')`
- `'Khung giờ gợi ý'` → `t('booking.suggestedSlots')`
- `'Thời lượng'` → `t('booking.duration')`
- `'Tiếp tục'` → `t('booking.continue')`
- `'Quay lại'` → `t('booking.back')`
- `'Kiểm tra lại'` → `t('booking.review')`
- `'Thông tin khách hàng'` → `t('booking.customerInfo')`
- `'Họ và tên'` → `t('booking.fullName')`
- `'Số điện thoại'` → `t('booking.phoneNumber')`
- `'Email (không bắt buộc)'` → `t('booking.emailOptional')`
- `'Ưu đãi thành viên'` → `t('booking.memberBenefits')`
- `'Ghi chú thêm'` → `t('booking.additionalNotes')`
- `'Xác nhận lịch đặt'` → `t('booking.confirmTitle')`
- `'Chi tiết sân'` → `t('booking.courtDetails')`
- `'Người đặt'` → `t('booking.bookerInfo')`
- `'Tổng cộng'` → `t('booking.total')`
- `'Giá gốc'` → `t('booking.basePrice')`
- `'Ưu đãi thành viên'` → `t('booking.memberDiscount')`
- `'Credit đã dùng'` → `t('booking.creditUsed')`
- `'Xác nhận đặt sân'` → `t('booking.confirmBooking')`
- `'Đang xử lý...'` → `t('booking.submitting')`
- `'Giờ cao điểm'` → `t('booking.peakTime')`
- `'Giờ thường'` → `t('booking.normalTime')`
- Navigate: `/${lang}/booking/success?ref=${ref}`
- Error fallback: `t('booking.bookingFailed')`
- All step 2 labels: Sân → `t('booking.court')`, Thời gian → `t('booking.time')`, etc.
- MemberSearch placeholder: `t('booking.memberSearchPlaceholder')`

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/customer/BookingFlow.tsx
git commit -m "feat: translate BookingFlow"
```

---

### Task 10: Translate BookingSuccessPage

**Files:**
- Modify: `client/src/pages/customer/BookingSuccessPage.tsx`

- [ ] **Step 1: Update BookingSuccessPage.tsx**

Replace the entire content of `client/src/pages/customer/BookingSuccessPage.tsx` with:

```tsx
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, Calendar, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const { lang = 'en' } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const ref = searchParams.get('ref') ?? 'N/A';

  return (
    <div className="min-h-screen">
      <div className="bg-shape shape-1 opacity-20" />
      <div className="bg-shape shape-2 opacity-10" />
      
      <Navbar />
      
      <main className="pt-20 flex items-center justify-center min-h-screen px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary shadow-neon mb-8"
          >
            <CheckCircle2 size={48} className="text-background" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-display font-black text-white mb-3 tracking-tight"
          >
            {t('bookingSuccess.title')} <span className="text-primary italic">{t('bookingSuccess.titleHighlight')}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 font-medium mb-10"
          >
            {t('bookingSuccess.message')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 border-white/10 mb-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">{t('bookingSuccess.bookingRef')}</p>
            <p className="text-4xl font-display font-black text-primary tracking-[0.2em] group-hover:scale-105 transition-transform duration-500">{ref}</p>
            <p className="text-[10px] text-gray-600 mt-3 uppercase font-bold tracking-wider">{t('bookingSuccess.saveRef')}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-10 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Info size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-3 uppercase tracking-tight">{t('bookingSuccess.guidelinesTitle')}</p>
                <ul className="text-xs text-gray-400 space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {t('bookingSuccess.guideline1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {t('bookingSuccess.guideline2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {t('bookingSuccess.guideline3')}
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to={`/${lang}/book`}
              className="btn-secondary group flex-1"
            >
              <Calendar size={18} className="group-hover:scale-110 transition-transform" />
              {t('bookingSuccess.bookAnother')}
            </Link>
            <Link
              to={`/${lang}`}
              className="btn-primary group flex-1 shadow-neon"
            >
              <Home size={18} className="group-hover:scale-110 transition-transform" />
              {t('bookingSuccess.goHome')}
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/customer/BookingSuccessPage.tsx
git commit -m "feat: translate BookingSuccessPage"
```

---

### Task 11: Translate shared components (PriceBreakdown, MemberSearch, Badge, Spinner)

**Files:**
- Modify: `client/src/components/PriceBreakdown.tsx`
- Modify: `client/src/components/MemberSearch.tsx`
- Modify: `client/src/components/Badge.tsx`
- Modify: `client/src/components/Spinner.tsx`

- [ ] **Step 1: Update PriceBreakdown.tsx**

Replace the entire content of `client/src/components/PriceBreakdown.tsx` with:

```tsx
import { useTranslation } from 'react-i18next';

interface PriceBreakdownProps {
  basePrice: number;
  discountAmount?: number;
  creditUsed?: number;
  finalPrice: number;
  currency?: string;
  isDark?: boolean;
}

export default function PriceBreakdown({
  basePrice,
  discountAmount = 0,
  creditUsed = 0,
  finalPrice,
  currency = 'VND',
}: PriceBreakdownProps) {
  const { t } = useTranslation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="bg-bg-panel rounded-xl p-4 border border-border-dark">
      <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">{t('price.title')}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">{t('price.base')}</span>
          <span className="text-text-base">{formatPrice(basePrice)} {currency}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-green">{t('price.discount')}</span>
            <span className="text-green">-{formatPrice(discountAmount)} {currency}</span>
          </div>
        )}
        {creditUsed > 0 && (
          <div className="flex justify-between">
            <span className="text-green">{t('price.creditUsed')}</span>
            <span className="text-green">-{formatPrice(creditUsed)} {currency}</span>
          </div>
        )}
        <div className="border-t border-border-dark pt-2 flex justify-between font-semibold">
          <span className="text-text-base">{t('price.total')}</span>
          <span className="text-indigo">{formatPrice(finalPrice)} {currency}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update MemberSearch.tsx**

Replace the entire content of `client/src/components/MemberSearch.tsx` with:

```tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { membersApi } from '../api/members';
import type { Member } from '../types';
import Spinner from './Spinner';

interface MemberSearchProps {
  onSelect: (member: Member | null) => void;
  selectedMember?: Member | null;
  placeholder?: string;
}

export default function MemberSearch({ onSelect, selectedMember, placeholder }: MemberSearchProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const defaultPlaceholder = placeholder || t('booking.memberSearchPlaceholder');

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', 'search', search],
    queryFn: () => membersApi.list({ search, limit: 10 }),
    enabled: search.length >= 2 && isOpen,
  });

  useEffect(() => {
    if (selectedMember) {
      setSearch(selectedMember.name || '');
    }
  }, [selectedMember]);

  const handleSelect = (member: Member) => {
    setSearch(member.name || '');
    setIsOpen(false);
    onSelect(member);
  };

  const handleClear = () => {
    setSearch('');
    setIsOpen(false);
    onSelect(null);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={defaultPlaceholder}
          className="w-full px-4 py-2.5 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo transition-colors"
        />
        {selectedMember && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text-base"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && search.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border-dark rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <Spinner size={20} />
            </div>
          ) : members?.data && members.data.length > 0 ? (
            <div className="py-1">
              {members.data.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelect(member)}
                  className="w-full px-4 py-2 text-left hover:bg-bg-panel transition-colors"
                >
                  <div className="text-sm font-medium text-text-base">{member.name}</div>
                  {member.phone && (
                    <div className="text-xs text-muted">{member.phone}</div>
                  )}
                  {member.memberships && member.memberships.length > 0 && (
                    <div className="text-xs text-muted">
                      {member.memberships[0].plan.toUpperCase()} - {member.memberships[0].creditBalance.toLocaleString()} VND credit
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted text-center">{t('common.noMemberFound')}</div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update Badge.tsx**

Replace the entire content of `client/src/components/Badge.tsx` with:

```tsx
import { useTranslation } from 'react-i18next';

interface BadgeProps {
  status: string;
  className?: string;
  children?: React.ReactNode;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-status-warning-bg text-status-warning-text border-status-warning-border',
  confirmed: 'bg-status-success-bg text-status-success-text border-status-success-border shadow-[0_0_10px_rgba(16,185,129,0.1)]',
  cancelled: 'bg-status-danger-bg text-status-danger-text border-status-danger-border',
  completed: 'bg-status-info-bg text-status-info-text border-status-info-border shadow-[0_0_10px_rgba(59,130,246,0.1)]',
  rejected:  'bg-status-danger-bg text-status-danger-text border-status-danger-border',
  active:    'bg-status-success-bg text-status-success-text border-status-success-border',
  inactive:  'bg-white/5 text-gray-500 border-white/5',
  basic:     'bg-white/5 text-gray-400 border-white/10',
  prime:     'bg-secondary/10 text-secondary border-secondary/20 shadow-[0_0_10px_rgba(0,229,255,0.1)]',
  vip:       'bg-primary/10 text-primary border-primary/20 shadow-neon',
};

const BADGE_KEYS: Record<string, string> = {
  pending:   'badge.pending',
  confirmed: 'badge.confirmed',
  cancelled: 'badge.cancelled',
  completed: 'badge.completed',
  rejected:  'badge.rejected',
  active:    'badge.active',
  inactive:  'badge.inactive',
};

export default function Badge({ status, children, className = '' }: BadgeProps) {
  const { t } = useTranslation();
  const normalizedStatus = status.toLowerCase();
  const style = STATUS_STYLES[normalizedStatus] ?? 'bg-white/5 text-gray-500 border-white/5';
  const translationKey = BADGE_KEYS[normalizedStatus];
  const label = children ?? (translationKey ? t(translationKey) : status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all duration-300 ${style} ${className}`}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 4: Update Spinner.tsx**

Replace the entire content of `client/src/components/Spinner.tsx` with:

```tsx
import { useTranslation } from 'react-i18next';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 24, className = '' }: SpinnerProps) {
  const { t } = useTranslation();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-label={t('common.loading')}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#1e2d42"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#6366F1"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add client/src/components/PriceBreakdown.tsx client/src/components/MemberSearch.tsx client/src/components/Badge.tsx client/src/components/Spinner.tsx
git commit -m "feat: translate shared components"
```

---

### Task 12: Verify build and test

- [ ] **Step 1: Run TypeScript check**

```bash
cd /Users/bcmac/Desktop/projects/sporthub/client && npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 2: Run dev build**

```bash
cd /Users/bcmac/Desktop/projects/sporthub/client && npx vite build
```

Expected: Build succeeds with no errors

- [ ] **Step 3: Fix any errors found in steps 1-2**

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete i18n multi-language support for customer pages"
```
