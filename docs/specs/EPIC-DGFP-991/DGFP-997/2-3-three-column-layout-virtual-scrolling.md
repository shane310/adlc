# Story 2.3: Three-Column Mail Workbench Layout with Virtual Scrolling

**Epic:** 2 - 邮件工作台核心  
**Story ID:** 2.3  
**Story Key:** `2-3-three-column-layout-virtual-scrolling`  
**Status:** ready-for-dev  
**Created:** 2026-03-22  
**NFR Coverage:** NFR-P8 (邮件列表虚拟滚动 ≥ 30fps)  
**FR Coverage:** FR16 (键盘快捷键基础实现)

---

## Story

**As a** 业务员 (Sales Representative),  
**I want** a high-performance three-column mail workbench layout with virtual scrolling email list,  
**So that** I can efficiently navigate and process thousands of emails with smooth performance (≥30fps) and keyboard shortcuts.

---

## Acceptance Criteria

**Given** a mail account with ≥ 10,000 emails synced to the system  
**When** the user navigates to the mail workbench view  
**Then** the three-column layout renders with:
  - Left column (280px): Email list with virtual scrolling
  - Center column (flex): Email reading pane (placeholder/"Select email" state)
  - Right column (320px): Customer context sidebar (placeholder for Epic 3)

**And** when scrolling the email list  
**Then** the frame rate remains ≥ 30fps (verified with browser DevTools FPS meter)

**And** when using keyboard navigation  
**Then** arrow keys (↑/↓) select the previous/next email with immediate visual feedback (< 100ms)

**And** when pressing Enter on a selected email  
**Then** the email content loads in the center reading pane

**Database:** None (frontend-only story, consumes existing `mail_messages` data via API)

---

## Implementation Requirements Summary

### Core Deliverables

1. **Three-Column Responsive Layout Component**
   - Desktop (1280px+): Three columns visible, resizable panels
   - Tablet (1024px): Two columns (list + content), right sidebar collapses
   - Mobile (768px): Single column stack with navigation

2. **Virtual Scrolling Email List**
   - Render visible items + ±50 buffer
   - Support 10,000+ emails at ≥30fps
   - IntersectionObserver for infinite scroll "load more"
   - Cursor-based pagination (NO offset pagination)

3. **Keyboard Navigation (Basic)**
   - Arrow keys (↑/↓): Navigate list selection
   - Enter: Open selected email in reading pane
   - Visual focus indicators with accessibility compliance

4. **Mail List Item Component**
   - Display: Sender, subject, preview text, time, unread indicator, star icon
   - States: Unread, read, selected, hover, starred
   - AI classification badge (placeholder for Epic 3)

5. **Reading Pane (Placeholder)**
   - Empty state: "Select an email to read"
   - Basic email header display (from, to, subject, date)
   - Sandboxed HTML rendering (security requirement NFR-S7)

6. **Performance Optimization**
   - Code splitting (lazy load mail module)
   - v-memo for list items
   - Debounced search (300ms)
   - Loading skeletons and optimistic UI

---

## Technical Architecture Context

### Frontend Stack (MANDATORY)

**Framework & Core:**
- **Vue 3** (Composition API, `<script setup>` syntax) - Latest 3.x
- **TypeScript 5.7+** (strict mode enabled)
- **Vite 6.x** - Build tool with HMR
- **Naive UI v2.44.1** - UI component library (includes `NVirtualList`)
- **Pinia** - State management (Composition API style)
- **@vueuse/core** - Vue composition utilities
- **Axios** - HTTP client with interceptors
- **pnpm 10.x** - Package manager
- **Turborepo v2.8.17** - Monorepo tooling

**Key Dependencies:**
```json
{
  "vue": "^3.x",
  "typescript": "^5.7",
  "vite": "^6.x",
  "naive-ui": "^2.44.1",
  "pinia": "latest",
  "@vueuse/core": "latest",
  "axios": "latest",
  "dayjs": "latest"
}
```

### Directory Structure (CRITICAL - Follow Exactly)

```
apps/web/src/modules/mail/
├── components/
│   ├── MailList.vue               # ✅ CREATE - Virtualized email list (LEFT COLUMN)
│   ├── MailListItem.vue           # ✅ CREATE - Individual email row component
│   ├── MailContent.vue            # ✅ CREATE - Email reading pane (CENTER COLUMN)
│   ├── MailToolbar.vue            # ✅ CREATE - Action toolbar (search, filters)
│   └── MailSandbox.vue            # ✅ CREATE - HTML email sandboxed renderer (iframe)
├── composables/
│   ├── useMailList.ts             # ✅ CREATE - Email list state & pagination logic
│   ├── useMailDetail.ts           # ⚠️  FUTURE - Single email state (Epic 2 later stories)
│   └── useKeyboardNav.ts          # ✅ CREATE - Keyboard navigation handler
├── stores/
│   └── useMailStore.ts            # ✅ CREATE - Pinia store for mail module
├── api/
│   └── mail.api.ts                # ✅ CREATE - API client for mail endpoints
├── views/
│   └── MailWorkstationView.vue    # ✅ CREATE - Main three-column workstation page
├── routes.ts                      # ✅ CREATE - Route definitions
└── index.ts                       # ✅ CREATE - Public module exports
```

```
apps/web/src/components/layout/
├── ThreeColumnLayout.vue          # ✅ CREATE - Generic 3-column layout (REUSABLE)
├── ResizablePanel.vue             # ✅ CREATE - Resizable panel wrapper component
└── [Existing layout components...]
```

**Shared Types Location:**
```
packages/shared-types/src/dto/
├── mail.dto.ts                    # ⚠️  READ ONLY - Email DTOs (DO NOT MODIFY)
└── pagination.dto.ts              # ⚠️  READ ONLY - Pagination types
```

### Component Architecture Specifications

#### 1. ThreeColumnLayout.vue (Generic Reusable Component)

**Location:** `apps/web/src/components/layout/ThreeColumnLayout.vue`

**Props:**
```typescript
interface Props {
  leftWidth?: number           // default: 280px
  rightWidth?: number          // default: 320px
  leftMinWidth?: number        // default: 240px
  rightMinWidth?: number       // default: 280px
  centerMinWidth?: number      // default: 520px
  resizable?: boolean          // default: true
  persistKey?: string          // localStorage key for width persistence
}
```

**Responsive Behavior:**
- **1280px+:** Three columns visible
- **1024px:** Right column collapses to drawer (toggleable via button)
- **768px:** Single column stack navigation

**Layout Grid:**
```
Desktop: [280px] | [flex, min 520px] | [320px]
Tablet:  [260px] | [flex, min 480px] | [drawer]
Mobile:  [100%] (stacked views)
```

#### 2. MailList.vue (Virtual Scrolling Email List)

**Location:** `apps/web/src/modules/mail/components/MailList.vue`

**Props:**
```typescript
interface Props {
  variant?: 'compact' | 'comfortable'  // default: 'compact'
  showPreview?: boolean                // default: true
  showAiBadge?: boolean                // default: true
}
```

**Virtual Scrolling Implementation:**

**Option A (RECOMMENDED): Use Naive UI NVirtualList**
```vue
<template>
  <NVirtualList
    :items="emails"
    :item-size="itemHeight"
    :buffer-size="50"
    class="mail-list"
  >
    <template #default="{ item }">
      <MailListItem
        :email="item"
        :selected="item.id === selectedEmailId"
        @click="selectEmail(item.id)"
      />
    </template>
  </NVirtualList>
</template>
```

**Option B: Custom Implementation with @vueuse/core**
```typescript
import { useVirtualList } from '@vueuse/core'

const { list: visibleEmails, containerProps, wrapperProps } = useVirtualList(
  emails,
  {
    itemHeight: 60,      // Fixed height for performance
    overscan: 50         // Buffer size
  }
)
```

**Key Features:**
- Visible items + ±50 buffer pre-rendered
- IntersectionObserver for "load more" trigger
- Fixed item heights (60px compact, 72px comfortable)
- Scroll position restoration on navigation return

**Item Height Calculation:**
- **Compact mode:** 60px per row
- **Comfortable mode:** 72px per row
- **Preview text enabled:** Add 20px (80px / 92px total)

#### 3. MailListItem.vue (Individual Email Row)

**Location:** `apps/web/src/modules/mail/components/MailListItem.vue`

**Props:**
```typescript
interface Props {
  email: MailListItemDto
  selected?: boolean
  variant?: 'compact' | 'comfortable'
}
```

**Visual States (CSS Classes):**
- `.mail-item--unread` - Bold text, unread dot indicator
- `.mail-item--read` - Normal weight
- `.mail-item--selected` - Background: `#2F6FEB`, white text
- `.mail-item--hover` - Subtle gray background, inline actions appear
- `.mail-item--starred` - Star icon filled `#D97706`

**Layout Structure:**
```
[●] [★] [Sender Name] [AI Badge] [Time]
            [Subject Line - Bold if unread]
            [Preview Text - Optional, gray]
```

**Typography (EXACT SPECS):**
- **Font Stack:** `"PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif`
- **Sender Name:** 14px, semi-bold (unread), normal (read)
- **Subject:** 14px, bold (unread), normal (read)
- **Preview:** 13px, gray `#6B7280`
- **Time:** 13px, gray `#9CA3AF`, right-aligned

**Spacing:**
- Horizontal padding: 16px
- Vertical padding: 8-12px
- Row height: 60px (compact), 72px (comfortable)

**Inline Actions (Hover State):**
- Archive button
- Star/unstar toggle
- Mark read/unread toggle
- Position: Right side, appear on hover

#### 4. MailContent.vue (Email Reading Pane - Placeholder)

**Location:** `apps/web/src/modules/mail/components/MailContent.vue`

**Props:**
```typescript
interface Props {
  emailId?: string | null  // null = show empty state
}
```

**States for This Story:**
1. **Empty State** (no email selected):
   ```vue
   <div class="mail-content-empty">
     <Icon name="mail-open" size="48" />
     <p>Select an email to read</p>
   </div>
   ```

2. **Loading State** (fetching email):
   ```vue
   <NSkeleton :repeat="5" />
   ```

3. **Loaded State** (basic header display):
   ```vue
   <div class="mail-header">
     <h2>{{ email.subject }}</h2>
     <div class="mail-meta">
       <span>From: {{ email.from.name }} <{{ email.from.address }}></span>
       <span>To: {{ email.to.map(t => t.address).join(', ') }}</span>
       <span>Date: {{ formatDate(email.receivedAt) }}</span>
     </div>
   </div>
   <div class="mail-body">
     <MailSandbox :html="email.bodyHtml" />
   </div>
   ```

**Security Note (NFR-S7):**
- HTML email content MUST be rendered in sandboxed iframe
- See `MailSandbox.vue` component below

#### 5. MailSandbox.vue (Sandboxed HTML Renderer)

**Location:** `apps/web/src/modules/mail/components/MailSandbox.vue`

**Purpose:** Securely render HTML email content to prevent XSS attacks (NFR-S7 requirement)

**Props:**
```typescript
interface Props {
  html: string
}
```

**Implementation Pattern:**
```vue
<template>
  <iframe
    ref="iframeRef"
    sandbox="allow-same-origin"
    class="mail-sandbox"
    @load="onLoad"
  />
</template>

<script setup lang="ts">
const props = defineProps<Props>()
const iframeRef = ref<HTMLIFrameElement>()

const sanitizedHtml = computed(() => {
  // Use DOMPurify or similar library to sanitize HTML
  return DOMPurify.sanitize(props.html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'img', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed']
  })
})

const onLoad = () => {
  if (iframeRef.value?.contentDocument) {
    iframeRef.value.contentDocument.body.innerHTML = sanitizedHtml.value
  }
}
</script>
```

**Security Requirements:**
- Sandbox attribute: `allow-same-origin` ONLY (NO `allow-scripts`)
- External images blocked by default (user opt-in to load)
- All links open in new tab with `rel="noopener noreferrer"`
- DOMPurify or equivalent sanitization library required

#### 6. MailToolbar.vue (Actions & Search)

**Location:** `apps/web/src/modules/mail/components/MailToolbar.vue`

**Features for This Story:**
- Search input (debounced 300ms)
- View toggle (compact/comfortable)
- Refresh button
- Batch actions bar (appears when items selected)

**Props:**
```typescript
interface Props {
  selectedCount?: number  // Number of selected emails
}
```

---

## State Management Requirements

### Pinia Store Structure (MANDATORY PATTERN)

**File:** `apps/web/src/modules/mail/stores/useMailStore.ts`

```typescript
import { defineStore } from 'pinia'
import type { MailListItemDto } from '@zhimao/shared-types'
import { mailApi } from '../api/mail.api'

export const useMailStore = defineStore('mail', () => {
  // ===== STATE (REQUIRED: loading, error) =====
  const emails = ref<MailListItemDto[]>([])
  const loading = ref(false)              // ✅ MANDATORY
  const error = ref<string | null>(null)  // ✅ MANDATORY
  const currentCursor = ref<string | null>(null)
  const hasMore = ref(true)
  const selectedEmailId = ref<string | null>(null)
  const totalCount = ref(0)

  // ===== GETTERS =====
  const unreadEmails = computed(() => 
    emails.value.filter(e => !e.isRead)
  )
  
  const selectedEmail = computed(() =>
    emails.value.find(e => e.id === selectedEmailId.value)
  )
  
  const unreadCount = computed(() => unreadEmails.value.length)

  // ===== ACTIONS =====
  async function fetchEmails(params?: { cursor?: string; limit?: number }) {
    loading.value = true
    error.value = null
    try {
      const res = await mailApi.findAll({
        cursor: params?.cursor ?? null,
        limit: params?.limit ?? 50,
        sortBy: 'receivedAt',
        order: 'desc'
      })
      
      // First load: replace. Load more: append
      if (!params?.cursor) {
        emails.value = res.data
      } else {
        emails.value.push(...res.data)
      }
      
      currentCursor.value = res.pagination.cursor
      hasMore.value = res.pagination.hasMore
      totalCount.value = res.pagination.totalCount ?? 0
      
      return res.pagination
    } catch (e: any) {
      error.value = e.response?.data?.error?.message || 'Failed to load emails'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || loading.value || !currentCursor.value) return
    await fetchEmails({ cursor: currentCursor.value, limit: 50 })
  }

  function selectEmail(id: string) {
    selectedEmailId.value = id
  }

  async function toggleStar(id: string) {
    const email = emails.value.find(e => e.id === id)
    if (!email) return
    
    // Optimistic UI update
    email.isStarred = !email.isStarred
    
    try {
      await mailApi.toggleStar(id, email.isStarred)
    } catch (e) {
      // Revert on failure
      email.isStarred = !email.isStarred
      throw e
    }
  }

  async function markAsRead(id: string) {
    const email = emails.value.find(e => e.id === id)
    if (!email || email.isRead) return
    
    // Optimistic UI update
    email.isRead = true
    
    try {
      await mailApi.markAsRead(id)
    } catch (e) {
      // Revert on failure
      email.isRead = false
      throw e
    }
  }

  return {
    // State
    emails, loading, error, hasMore, selectedEmailId, totalCount,
    // Getters
    unreadEmails, selectedEmail, unreadCount,
    // Actions
    fetchEmails, loadMore, selectEmail, toggleStar, markAsRead
  }
})
```

**Store Constraints (from Architecture):**
- Each Store ≤ 300 lines (split if exceeds)
- Must have `loading` and `error` state (MANDATORY)
- Use Composition API style (`setup()` syntax)
- All async operations use try/catch/finally pattern
- Optimistic UI updates for toggle actions (star, read/unread)

### Composables

#### useMailList.ts (Page-Level State & Logic)

**File:** `apps/web/src/modules/mail/composables/useMailList.ts`

```typescript
import { computed, onMounted, ref } from 'vue'
import { useMailStore } from '../stores/useMailStore'
import { useIntersectionObserver } from '@vueuse/core'

export function useMailList() {
  const store = useMailStore()
  const searchQuery = ref('')
  const loadMoreTrigger = ref<HTMLElement>()

  // Filtered emails based on search
  const filteredEmails = computed(() => {
    if (!searchQuery.value) return store.emails
    
    const query = searchQuery.value.toLowerCase()
    return store.emails.filter(email => 
      email.subject.toLowerCase().includes(query) ||
      email.from.name?.toLowerCase().includes(query) ||
      email.from.address.toLowerCase().includes(query)
    )
  })

  // IntersectionObserver for infinite scroll
  const { stop } = useIntersectionObserver(
    loadMoreTrigger,
    ([{ isIntersecting }]) => {
      if (isIntersecting && !store.loading && store.hasMore) {
        store.loadMore()
      }
    },
    { threshold: 0.5 }
  )

  // Auto-fetch on mount if empty
  onMounted(async () => {
    if (store.emails.length === 0) {
      await store.fetchEmails()
    }
  })

  return {
    emails: filteredEmails,
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    hasMore: computed(() => store.hasMore),
    searchQuery,
    loadMoreTrigger,
    selectEmail: store.selectEmail,
    toggleStar: store.toggleStar,
    markAsRead: store.markAsRead,
    refresh: () => store.fetchEmails()
  }
}
```

#### useKeyboardNav.ts (Keyboard Navigation Logic)

**File:** `apps/web/src/modules/mail/composables/useKeyboardNav.ts`

```typescript
import { onMounted, onUnmounted } from 'vue'
import { useMailStore } from '../stores/useMailStore'

export function useKeyboardNav() {
  const store = useMailStore()

  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore if user is typing in input field
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return
    }

    const currentIndex = store.emails.findIndex(
      e => e.id === store.selectedEmailId
    )

    switch (event.key) {
      case 'ArrowUp':
      case 'k':
        event.preventDefault()
        if (currentIndex > 0) {
          store.selectEmail(store.emails[currentIndex - 1].id)
          scrollToSelected()
        }
        break

      case 'ArrowDown':
      case 'j':
        event.preventDefault()
        if (currentIndex < store.emails.length - 1) {
          store.selectEmail(store.emails[currentIndex + 1].id)
          scrollToSelected()
        }
        break

      case 'Enter':
        event.preventDefault()
        // Selected email already loads in reading pane via reactivity
        // Mark as read
        if (store.selectedEmailId) {
          store.markAsRead(store.selectedEmailId)
        }
        break

      case 'Escape':
        event.preventDefault()
        store.selectEmail(null) // Deselect
        break
    }
  }

  const scrollToSelected = () => {
    // Scroll selected item into view
    const selectedEl = document.querySelector('.mail-item--selected')
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
```

---

## API Integration Specifications

### API Response Format (MANDATORY - Response Envelope Pattern)

**All API responses MUST follow this envelope format:**

**Success Response:**
```json
{
  "success": true,
  "data": [ /* MailListItemDto[] */ ],
  "pagination": {
    "cursor": "eyJpZCI6MTAwfQ==",
    "hasMore": true,
    "totalCount": 1500
  },
  "meta": {
    "timestamp": "2026-03-22T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "MAIL_SYNC_001",
    "message": "IMAP connection failed",
    "details": {
      "account": "user@example.com",
      "provider": "Gmail"
    }
  },
  "meta": {
    "timestamp": "2026-03-22T10:00:00Z",
    "requestId": "req_xyz789"
  }
}
```

### Pagination Pattern (CURSOR-BASED ONLY)

**❌ FORBIDDEN: Offset pagination** (does not scale)  
**✅ REQUIRED: Cursor-based pagination**

**Request Parameters:**
```typescript
interface PaginationQuery {
  cursor?: string | null  // Base64 encoded ID from previous response
  limit?: number          // Default 20, max 100
  sortBy?: string         // e.g., 'receivedAt'
  order?: 'asc' | 'desc'  // Default 'desc'
}
```

**Example API Call:**
```
GET /api/v1/emails?cursor=eyJpZCI6MTAwfQ&limit=50&sortBy=receivedAt&order=desc
```

### Mail DTO Structure (READ ONLY - Do Not Modify)

**File:** `packages/shared-types/src/dto/mail.dto.ts`

**MailListItemDto (List View - NO BODY):**
```typescript
export interface MailListItemDto {
  id: string                        // UUID
  subject: string
  from: EmailAddress                // { address: string, name?: string }
  to: EmailAddress[]
  receivedAt: string                // ISO 8601 UTC format
  isRead: boolean
  isStarred: boolean
  hasAttachment: boolean
  previewText?: string              // First 150 chars
  aiCategory?: 'inquiry' | 'followup' | 'general' | 'other'
  aiSummary?: string                // One-sentence AI summary
  customerId?: string               // Linked customer ID (null if not linked)
}
```

**MailDetailDto (Reading Pane - WITH BODY):**
```typescript
export interface MailDetailDto extends MailListItemDto {
  bodyHtml: string                  // Full HTML body
  bodyText: string                  // Plain text version
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  replyTo?: EmailAddress
  attachments: AttachmentDto[]
  headers: Record<string, string>   // Raw email headers
}
```

**Architecture Decision Quote:**
> "邮件列表API：不返回正文，返回subject+from+date+aiSummary+category"

This separation is critical for performance - list API returns lightweight DTOs without body content.

### API Client Implementation

#### Axios Client Setup

**File:** `apps/web/src/api/client.ts` (CREATE IF NOT EXISTS)

```typescript
import axios from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor - Attach Access Token
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor - Unwrap envelope & handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap Response Envelope - return data + pagination
    return response.data
  },
  async (error) => {
    // Handle 401 - Auto-refresh token
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      try {
        await authStore.refreshToken()
        // Retry original request
        return apiClient.request(error.config)
      } catch (refreshError) {
        // Refresh failed - redirect to login
        authStore.logout()
        window.location.href = '/login'
      }
    }
    
    // Pass error to caller
    return Promise.reject(error)
  }
)
```

#### Mail API Module

**File:** `apps/web/src/modules/mail/api/mail.api.ts`

```typescript
import { apiClient } from '@/api/client'
import type { 
  MailListItemDto, 
  MailDetailDto,
  PaginationQuery,
  ApiResponse 
} from '@zhimao/shared-types'

export const mailApi = {
  /**
   * Fetch paginated email list (NO BODY)
   */
  async findAll(params: PaginationQuery) {
    return apiClient.get<ApiResponse<MailListItemDto[]>>('/emails', { 
      params 
    })
  },

  /**
   * Fetch single email with full body
   */
  async findOne(id: string) {
    return apiClient.get<ApiResponse<MailDetailDto>>(`/emails/${id}`)
  },

  /**
   * Mark email as read
   */
  async markAsRead(id: string) {
    return apiClient.patch(`/emails/${id}`, { isRead: true })
  },

  /**
   * Toggle star status
   */
  async toggleStar(id: string, isStarred: boolean) {
    return apiClient.patch(`/emails/${id}`, { isStarred })
  },

  /**
   * Batch mark as read
   */
  async batchMarkAsRead(ids: string[]) {
    return apiClient.post('/emails/batch/mark-read', { ids })
  },

  /**
   * Search emails (uses same cursor pagination)
   */
  async search(query: string, params?: PaginationQuery) {
    return apiClient.get<ApiResponse<MailListItemDto[]>>('/emails/search', {
      params: { q: query, ...params }
    })
  }
}
```

---

## Performance Optimization Requirements

### NFR-P8 Compliance: Virtual Scrolling ≥ 30fps

**Target Performance:**
- 10,000+ emails in list
- Scrolling frame rate ≥ 30fps (ideally 60fps)
- Initial load < 2s (NFR-P1)
- Keyboard navigation response < 100ms

**Optimization Strategies:**

#### 1. Virtual Scrolling (MANDATORY)

**Why:** Rendering 10,000+ DOM nodes destroys performance. Virtual scrolling renders only visible items + buffer.

**Implementation:**
- Use Naive UI `NVirtualList` (recommended) OR `@vueuse/core` `useVirtualList`
- Buffer size: ±50 items (100 total buffer)
- Fixed item heights: 60px (compact) or 72px (comfortable)
- IntersectionObserver for "load more" detection

**Performance Calculation:**
```
Viewport height: ~800px
Item height: 60px
Visible items: 800 / 60 = ~13 items
Buffer: ±50 items
Total rendered: 13 + 100 = 113 DOM nodes (regardless of total count)
```

#### 2. Code Splitting (Route-Level Lazy Loading)

**File:** `apps/web/src/modules/mail/routes.ts`

```typescript
export const mailRoutes = [
  {
    path: '/mail',
    component: () => import('./views/MailWorkstationView.vue'),  // ✅ Lazy load
    meta: { requiresAuth: true }
  }
]
```

#### 3. Component Optimization

**v-memo for List Items (Critical):**

In `MailList.vue`:
```vue
<MailListItem
  v-for="email in visibleEmails"
  :key="email.id"
  v-memo="[email.id, email.isRead, email.isStarred, email.id === selectedEmailId]"
  :email="email"
  :selected="email.id === selectedEmailId"
/>
```

**v-memo explanation:**
- Re-render only if dependencies change (id, isRead, isStarred, selected state)
- Prevents unnecessary re-renders when scrolling
- Critical for 30fps+ performance

**Debounced Search:**
```typescript
import { useDebounceFn } from '@vueuse/core'

const searchQuery = ref('')
const debouncedSearch = useDebounceFn((query: string) => {
  // Execute search
  store.fetchEmails({ search: query })
}, 300)  // 300ms debounce

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})
```

#### 4. Loading States & Skeleton Screens

**Initial Load:**
```vue
<template v-if="loading && emails.length === 0">
  <NSkeleton
    v-for="i in 10"
    :key="i"
    height="60px"
    :sharp="false"
  />
</template>
```

**Load More (Bottom Spinner):**
```vue
<div ref="loadMoreTrigger" class="load-more-trigger">
  <NSpin v-if="loading && emails.length > 0" />
  <p v-else-if="!hasMore">No more emails</p>
</div>
```

#### 5. Image Optimization

**External Images in Emails:**
- Block by default (security + performance)
- User opt-in button: "Load images"
- Use `loading="lazy"` for attachments

#### 6. Bundle Optimization (Vite Configuration)

**File:** `apps/web/vite.config.ts`

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['naive-ui'],
          'vendor-utils': ['axios', '@vueuse/core', 'dayjs']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['naive-ui', 'vue', 'pinia']
  }
})
```

### Performance Monitoring

**FPS Verification (Developer Testing):**
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Scroll email list rapidly
4. Stop recording
5. Check FPS graph - should stay ≥ 30fps (green zone)

**Architecture Quote:**
> "所有异步操作必须有对应的loading状态。禁止'无反馈'操作——用户的每一个点击都必须有即时视觉反馈（≤100ms）"

**Implementation Checklist:**
- [ ] All API calls show loading state (spinner/skeleton)
- [ ] Keyboard navigation updates UI < 100ms (synchronous state update)
- [ ] Optimistic UI for toggle actions (star, read/unread)
- [ ] Error states with retry button

---

## Keyboard Navigation Specification (FR16 Basic)

### Implemented Shortcuts (This Story)

| Key | Action | Scope |
|-----|--------|-------|
| `↑` / `k` | Select previous email | Email list |
| `↓` / `j` | Select next email | Email list |
| `Enter` | Open selected email & mark as read | Email list |
| `Esc` | Deselect / Close reading pane | Global |

**Note:** Full keyboard shortcuts (reply, archive, star, etc.) will be implemented in Story 2.10 (FR16 complete).

### Keyboard Navigation Behavior

**Focus Management:**
1. User lands on mail workbench → First email auto-selected
2. Arrow keys navigate selection → Visual highlight updates immediately (< 100ms)
3. Selected email auto-scrolls into view if off-screen (smooth scroll)
4. Enter key → Load email content in reading pane + mark as read

**Conflict Prevention:**
- Keyboard shortcuts disabled when focus is in input fields (search, compose)
- Use `event.target` check in `useKeyboardNav.ts`

**Accessibility (WCAG AA):**
- Keyboard-only navigation fully functional
- Visual focus indicators (2px outline, high contrast)
- ARIA labels for screen readers:
  - `aria-label="Email list"` on list container
  - `aria-selected="true"` on selected item
  - `aria-live="polite"` on reading pane for content changes

### Visual Focus Indicators

**Selected Email (Keyboard or Click):**
- Background: `#2F6FEB` (accent blue)
- Text: White for high contrast
- Border: None (background provides clear indication)

**Keyboard Focus Ring (when tabbing):**
- Outline: `2px solid #2F6FEB`
- Outline offset: `2px`
- Visible for keyboard users, hidden for mouse users (`:focus-visible`)

**CSS Implementation:**
```css
.mail-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.mail-item--selected {
  background-color: var(--color-primary);
  color: white;
}
```

---

## UX Design Specifications

### Color Palette (Mail Module)

**Base Colors:**
- Page background: `#F5F7FA`
- Panel surfaces: `#FFFFFF`
- Divider lines: `#E5E7EB`

**Interactive Colors:**
- Primary (selected): `#2F6FEB`
- Hover: `#F3F4F6`
- Unread indicator: `#2F6FEB` (blue dot)
- Starred: `#D97706` (amber/orange)

**Text Colors:**
- Primary text: `#111827`
- Secondary text: `#6B7280`
- Tertiary/time: `#9CA3AF`

**AI Badge Colors:**
- Background: `#F0F4FF` (light blue-purple)
- Border/text: `#6366F1` (indigo)

### Typography System

**Font Stack:**
```css
font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, -apple-system, sans-serif;
```

**Mail List Item:**
- Sender name: 14px, semi-bold (unread), normal (read)
- Subject: 14px, bold (unread), normal (read)
- Preview text: 13px, color `#6B7280`
- Time: 13px, color `#9CA3AF`

**Reading Pane:**
- Subject: 18-20px, bold
- Email body: 15-16px, line-height 1.6-1.75 (readable)

### Spacing System (8px Grid)

All spacing uses multiples of 8px: `8, 16, 24, 32, 40, 48`

**Mail List Item:**
- Row height: 60px (compact), 72px (comfortable)
- Horizontal padding: 16px
- Vertical padding: 8-12px
- Gap between elements: 8px

**Panel Gaps:**
- Between columns: 16px
- Content padding: 16-24px

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Desktop Wide | 1440px+ | Three columns, max-width constraints |
| Desktop | 1280px+ | Three columns (baseline) |
| Tablet | 1024px | Two columns (list + content), right drawer |
| Mobile | 768px | Single column stack |

**Layout Behavior:**
- **1280px+:** `[280px] | [flex] | [320px]`
- **1024px:** `[260px] | [flex] | [drawer toggle]`
- **768px:** `[100%]` - Full width stacked views

<!-- SECTION_BREAK_10 -->









