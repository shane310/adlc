export interface PaginationQuery {
  cursor?: string | null
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface PaginationMeta {
  cursor: string | null
  hasMore: boolean
  totalCount?: number
}
