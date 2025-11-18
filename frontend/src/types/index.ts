export enum Role {
  ADMIN = 'admin',
  ARCHIVIST = 'archivist',
  RESEARCHER = 'researcher',
}

export enum AccessLevel {
  PUBLIC = 'public',
  RESTRICTED = 'restricted',
}

export enum RequestType {
  VIEW = 'view',
  SCAN = 'scan',
}

export enum RequestStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface User {
  id: number
  email: string
  fullName: string
  role: Role
}

export interface Fond {
  id: number
  code: string
  title: string
  description?: string
  coverageDates?: string
  createdAt: string
  updatedAt: string
}

export interface Inventory {
  id: number
  fondId: number
  fond?: Fond
  number: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface Keyword {
  id: number
  value: string
}

export interface DigitalCopy {
  id: number
  recordId: number
  uri: string
  mimeType: string
  filesize: number
  createdAt: string
  updatedAt: string
}

export interface Record {
  id: number
  inventoryId: number
  inventory?: Inventory
  refCode: string
  title: string
  annotation?: string
  dateFrom?: string
  dateTo?: string
  extent?: string
  accessLevel: AccessLevel
  keywords?: Keyword[]
  digitalCopies?: DigitalCopy[]
  createdAt: string
  updatedAt: string
}

export interface Request {
  id: number
  recordId: number
  record?: Record
  userId: number
  user?: User
  type: RequestType
  status: RequestStatus
  createdAt: string
  updatedAt: string
}

