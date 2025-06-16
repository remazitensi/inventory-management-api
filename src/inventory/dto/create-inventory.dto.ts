import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  IsEnum,
  Length,
} from 'class-validator';

export enum InventoryTransactionType {
  IN = 'IN', // 입고
  OUT = 'OUT', // 출고
}

export class CreateInventoryDto {
  @ApiProperty({ example: 'ZR001', description: '제품 코드' })
  @IsNotEmpty({ message: '제품 코드는 반드시 입력해야 합니다.' })
  @IsString({ message: '제품 코드는 문자열이어야 합니다.' })
  @Length(1, 50, {
    message: '제품 코드는 1자 이상 50자 이하로 입력해야 합니다.',
  })
  productCode: string;

  @ApiProperty({
    example: 100,
    description: '수량 (입고시 양수, 출고시 양수로 입력)',
    minimum: 1,
  })
  @IsNotEmpty({ message: '수량은 반드시 입력해야 합니다.' })
  @IsNumber({}, { message: '수량은 숫자여야 합니다.' })
  @Min(1, { message: '수량은 1 이상이어야 합니다.' })
  quantity: number;

  @ApiProperty({
    enum: InventoryTransactionType,
    example: InventoryTransactionType.IN,
    description: '거래 유형 (IN: 입고, OUT: 출고)',
  })
  @IsNotEmpty({ message: '거래 유형은 반드시 입력해야 합니다.' })
  @IsEnum(InventoryTransactionType, {
    message: '거래 유형은 IN(입고) 또는 OUT(출고)이어야 합니다.',
  })
  transactionType: InventoryTransactionType;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: '유통기한 (YYYY-MM-DD 형식, 선택사항)',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: '유통기한은 올바른 날짜 형식(YYYY-MM-DD)이어야 합니다.' },
  )
  expirationDate?: string;

  @ApiPropertyOptional({
    example: 'LOT001',
    description: '로트 번호',
  })
  @IsOptional()
  @IsString({ message: '로트 번호는 문자열이어야 합니다.' })
  @Length(1, 50, {
    message: '로트 번호는 1자 이상 50자 이하로 입력해야 합니다.',
  })
  lotNumber?: string;

  @ApiPropertyOptional({
    example: '정기 입고',
    description: '비고',
  })
  @IsOptional()
  @IsString({ message: '비고는 문자열이어야 합니다.' })
  @Length(1, 500, {
    message: '비고는 1자 이상 500자 이하로 입력해야 합니다.',
  })
  notes?: string;
}
