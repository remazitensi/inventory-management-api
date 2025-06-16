import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: '지르코니아 블록' })
  @IsNotEmpty({ message: '제품명은 반드시 입력해야 합니다.' })
  @IsString({ message: '제품명은 문자열이어야 합니다.' })
  @Length(1, 200, {
    message: '제품명은 1자 이상 200자 이하로 입력해야 합니다.',
  })
  name: string;

  @ApiProperty({ example: 'ZR001' })
  @IsNotEmpty({ message: '제품 코드는 반드시 입력해야 합니다.' })
  @IsString({ message: '제품 코드는 문자열이어야 합니다.' })
  @Length(1, 50, {
    message: '제품 코드는 1자 이상 50자 이하로 입력해야 합니다.',
  })
  @Matches(/^[A-Z0-9]+$/, {
    message: '제품 코드는 영문 대문자와 숫자만 사용할 수 있습니다. (예: ZR001)',
  })
  code: string;

  @ApiPropertyOptional({ example: 'CAD/CAM용 지르코니아 블록, 고강도' })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description?: string;

  @ApiPropertyOptional({ example: '소모품' })
  @IsOptional()
  @IsString({ message: '카테고리는 문자열이어야 합니다.' })
  @Length(1, 100, {
    message: '카테고리는 1자 이상 100자 이하로 입력해야 합니다.',
  })
  category?: string;

  @ApiPropertyOptional({ example: '개' })
  @IsOptional()
  @IsString({ message: '단위는 문자열이어야 합니다.' })
  @Length(1, 20, {
    message: '단위는 1자 이상 20자 이하로 입력해야 합니다.',
  })
  unit?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
