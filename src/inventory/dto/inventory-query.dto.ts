import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { PaginationDto } from '@common/dto/pagination.dto';
import { SortDto, SortOrder } from '@common/dto/sort.dto';
import { InventoryBalance } from '@inventory/entities/inventoryBalance.entitiy';

export class InventoryBalanceQueryDto
  extends PaginationDto
  implements SortDto<keyof InventoryBalance & string>
{
  @ApiPropertyOptional({ example: 'ZR001', description: '제품 코드로 검색' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({ example: 'LOT001', description: '로트 번호로 검색' })
  @IsOptional()
  @IsString()
  lotNumber?: string;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: '유통기한 시작일 (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString({}, { message: '날짜는 YYYY-MM-DD 형식이어야 합니다.' })
  expirationDateFrom?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: '유통기한 종료일 (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString({}, { message: '날짜는 YYYY-MM-DD 형식이어야 합니다.' })
  expirationDateTo?: string;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: '정렬 순서 (ASC, DESC)',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: '정렬 기준 컬럼명' })
  @IsOptional()
  @IsString()
  orderBy?: keyof InventoryBalance & string;
}
