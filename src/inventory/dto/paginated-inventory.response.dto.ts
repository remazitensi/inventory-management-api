import { ApiProperty } from '@nestjs/swagger';
import { InventoryBalance } from '@inventory/entities/inventoryBalance.entitiy';

export class PaginatedInventoryBalanceResponseDto {
  @ApiProperty({ type: [InventoryBalance], description: '재고 상태 목록' })
  items: InventoryBalance[];

  @ApiProperty({ example: 100, description: '총 개수' })
  total: number;

  @ApiProperty({ example: 1, description: '현재 페이지' })
  page: number;

  @ApiProperty({ example: 10, description: '페이지당 개수' })
  limit: number;

  @ApiProperty({ example: 10, description: '총 페이지 수' })
  totalPages: number;
}
