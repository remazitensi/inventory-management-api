import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsDateString,
  IsOptional,
  Matches,
} from 'class-validator';

export enum InventoryTransactionType {
  IN = 'IN',
  OUT = 'OUT',
}

export class CreateInventoryDto {
  @ApiProperty({ example: 'ZR001', description: '제품 코드' })
  @IsNotEmpty({ message: '제품 코드는 반드시 입력해야 합니다.' })
  @IsString({ message: '제품 코드는 문자열이어야 합니다.' })
  @Matches(/^[A-Z0-9]+$/, {
    message: '제품 코드는 영문 대문자와 숫자만 사용할 수 있습니다. (예: ZR001)',
  })
  productCode: string;

  @ApiProperty({ example: 'LOT001', description: '로트 번호' })
  @IsNotEmpty({ message: '로트 번호는 반드시 입력해야 합니다.' })
  @IsString({ message: '로트 번호는 문자열이어야 합니다.' })
  lotNumber: string;

  @ApiProperty({ example: 50, description: '입출고 수량 (양수만 가능)' })
  @IsInt({ message: '수량은 정수여야 합니다.' })
  @Min(1, { message: '수량은 1 이상이어야 합니다.' })
  quantity: number;

  @ApiProperty({
    enum: InventoryTransactionType,
    example: InventoryTransactionType.IN,
    description: '입출고 구분',
  })
  @IsNotEmpty({ message: '거래 유형은 반드시 입력해야 합니다.' })
  @IsEnum(InventoryTransactionType, {
    message: '입출고 타입은 IN 또는 OUT이어야 합니다.',
  })
  type: InventoryTransactionType;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: '유통기한 (없을 수도 있음)',
  })
  @IsOptional()
  @IsDateString({}, { message: '유통기한은 YYYY-MM-DD 형식이어야 합니다.' })
  expirationDate?: string;
}
