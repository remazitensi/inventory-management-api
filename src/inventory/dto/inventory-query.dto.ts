import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '@common/dto/pagination.dto';

export class InventoryQueryDto extends PaginationDto {
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
}
