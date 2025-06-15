export interface JwtPayload {
  sub: number; // 사용자 ID
  email: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}
