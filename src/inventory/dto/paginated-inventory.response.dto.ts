import { ApiProperty } from '@nestjs/swagger';
import { Inventory } from '../entities/inventory.entity';

export class PaginatedInventoryResponseDto {
  @ApiProperty({ type: [Inventory], description: '재고 목록' })
  items: Inventory[];

  @ApiProperty({ example: 100, description: '총 개수' })
  total: number;

  @ApiProperty({ example: 1, description: '현재 페이지' })
  page: number;

  @ApiProperty({ example: 10, description: '페이지당 개수' })
  limit: number;

  @ApiProperty({ example: 10, description: '총 페이지 수' })
  totalPages: number;
}
