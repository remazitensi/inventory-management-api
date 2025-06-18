import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '@products/entities/product.entity';

export enum InventoryTransactionType {
  IN = 'IN', // 입고
  OUT = 'OUT', // 출고
}

@Entity('inventories')
@Index(['productId', 'lotNumber', 'expirationDate'])
@Index(['productId', 'expirationDate'])
export class Inventory {
  @ApiProperty({ example: 1, description: '재고 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: '제품 ID' })
  @Column()
  @Index()
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({ example: 100, description: '현재 재고 수량' })
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ApiProperty({ example: 50, description: '거래 수량' })
  @Column({ type: 'int' })
  transactionQuantity: number;

  @ApiProperty({
    enum: InventoryTransactionType,
    example: InventoryTransactionType.IN,
    description: '거래 유형',
  })
  @Column({
    type: 'enum',
    enum: InventoryTransactionType,
  })
  transactionType: InventoryTransactionType;

  @ApiProperty({
    example: '2024-12-31',
    description: '유통기한',
    nullable: true,
  })
  @Column({ type: 'date', nullable: true })
  @Index()
  expirationDate?: Date;

  @ApiProperty({
    example: 'LOT001',
    description: '로트 번호',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  lotNumber?: string;

  @ApiProperty({
    example: '정기 입고',
    description: '비고',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: '생성일시' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  @UpdateDateColumn()
  updatedAt: Date;
}
