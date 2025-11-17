export enum ErrorType {
  AUTH = 'auth',
  NETWORK = 'network',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  originalError?: any;
  timestamp: Date;
}
