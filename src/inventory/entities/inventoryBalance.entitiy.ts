import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('inventory_balances')
@Index(['productCode', 'lotNumber', 'expirationDate'], { unique: true })
@Index(['productCode', 'expirationDate'])
export class InventoryBalance {
  @ApiProperty({ example: 1, description: '재고 상태 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'ZR001', description: '제품 코드' })
  @Column({ type: 'varchar', length: 50 })
  @Index()
  productCode: string;

  @ApiProperty({
    example: 'LOT001',
    description: '로트 번호',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  lotNumber?: string;

  @ApiProperty({
    example: '2024-12-31',
    description: '유통기한',
    nullable: true,
  })
  @Column({ type: 'date', nullable: true })
  @Index()
  expirationDate?: Date;

  @ApiProperty({ example: 100, description: '현재 재고 수량' })
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ApiProperty({ description: '생성일시' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '버전 (낙관적 락)' })
  @VersionColumn()
  version: number;
}
