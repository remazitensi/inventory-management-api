import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: '사용자 ID' })
  id: number;

  @ApiProperty({ example: 'test@example.com', description: '이메일' })
  email: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
  }
}
