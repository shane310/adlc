import type { PaginationMeta } from './dto/pagination.dto.js'

export interface ApiSuccessEnvelope<T> {
  success: true
  data: T
  pagination?: PaginationMeta
  meta?: { timestamp?: string; requestId?: string }
}

export interface ApiErrorEnvelope {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: { timestamp?: string; requestId?: string }
}

export type ApiResponse<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope
