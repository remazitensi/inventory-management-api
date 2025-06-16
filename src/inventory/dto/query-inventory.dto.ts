import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum InventoryOrderBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  PRODUCT_CODE = 'productCode',
  QUANTITY = 'quantity',
  EXPIRATION_DATE = 'expirationDate',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryInventoryDto {
  @ApiPropertyOptional({
    example: 1,
    description: '페이지 번호 (1부터 시작)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '페이지 번호는 숫자여야 합니다.' })
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다.' })
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: '페이지당 항목 수',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '페이지당 항목 수는 숫자여야 합니다.' })
  @Min(1, { message: '페이지당 항목 수는 1 이상이어야 합니다.' })
  @Max(100, { message: '페이지당 항목 수는 100 이하여야 합니다.' })
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'ZR001',
    description: '제품 코드로 검색',
  })
  @IsOptional()
  @IsString({ message: '제품 코드는 문자열이어야 합니다.' })
  productCode?: string;

  @ApiPropertyOptional({
    example: 'LOT001',
    description: '로트 번호로 검색',
  })
  @IsOptional()
  @IsString({ message: '로트 번호는 문자열이어야 합니다.' })
  lotNumber?: string;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: '유통기한 시작일 (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: '시작일은 올바른 날짜 형식(YYYY-MM-DD)이어야 합니다.' },
  )
  expirationDateFrom?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: '유통기한 종료일 (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: '종료일은 올바른 날짜 형식(YYYY-MM-DD)이어야 합니다.' },
  )
  expirationDateTo?: string;

  @ApiPropertyOptional({
    enum: InventoryOrderBy,
    example: InventoryOrderBy.CREATED_AT,
    description: '정렬 기준',
    default: InventoryOrderBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(InventoryOrderBy, { message: '올바른 정렬 기준을 선택해주세요.' })
  orderBy?: InventoryOrderBy = InventoryOrderBy.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: '정렬 순서',
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: '정렬 순서는 ASC 또는 DESC여야 합니다.' })
  sortOrder?: SortOrder = SortOrder.DESC;
}
