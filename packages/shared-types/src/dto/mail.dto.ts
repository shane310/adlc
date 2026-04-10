export interface EmailAddress {
  address: string
  name?: string
}

export interface MailListItemDto {
  id: string
  subject: string
  from: EmailAddress
  to: EmailAddress[]
  receivedAt: string
  isRead: boolean
  isStarred: boolean
  hasAttachment: boolean
  previewText?: string
  aiCategory?: 'inquiry' | 'followup' | 'general' | 'other'
  aiSummary?: string
  customerId?: string
}

export interface AttachmentDto {
  id: string
  filename: string
  size: number
  mimeType: string
}

export interface MailDetailDto extends MailListItemDto {
  bodyHtml: string
  bodyText: string
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  replyTo?: EmailAddress
  attachments: AttachmentDto[]
  headers: Record<string, string>
}
