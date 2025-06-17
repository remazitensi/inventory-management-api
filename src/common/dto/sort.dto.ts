import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SortDto<T extends string> {
  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.DESC,
    description: '정렬 순서 (ASC 또는 DESC)',
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: '정렬 순서는 ASC 또는 DESC여야 합니다.' })
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: '정렬 기준 컬럼명' })
  @IsOptional()
  @IsString({ message: '정렬 기준은 문자열이어야 합니다.' })
  orderBy?: T;
}
