import { ApiProperty } from '@nestjs/swagger';
import { Product } from '@products/entities/product.entity';

export class ProductResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '제품 등록 성공' })
  message: string;

  @ApiProperty({ type: () => Product })
  data: Product;
}

export class ProductListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '제품 목록 조회 성공' })
  message: string;

  @ApiProperty({ type: () => [Product] })
  data: Product[];
}
