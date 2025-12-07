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
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export interface User {
  id: number
  email: string
  fullName: string
  role: Role
  occupation?: string   // Род деятельности
  workplace?: string    // Место работы
  position?: string     // Должность
}

export interface UpdateProfileData {
  fullName?: string
  occupation?: string
  workplace?: string
  position?: string
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
  filePath?: string
  fileName?: string
  fileSize?: number
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
  rejectionReason?: string
  processedById?: number
  processedBy?: User
  processedAt?: string
  createdAt: string
  updatedAt: string
}

