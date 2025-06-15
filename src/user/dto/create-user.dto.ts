import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'test@example.com', description: '이메일' })
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @ApiProperty({
    example: 'Abcd1234!',
    description: '비밀번호 (8~20자, 영문/숫자/특수문자 포함)',
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 이하이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      '비밀번호는 영문, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.',
  })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  password: string;
}
