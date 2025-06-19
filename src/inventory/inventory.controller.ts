import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InventoryService } from '@inventory/inventory.service';
import { CreateInventoryDto } from '@inventory/dto/create-inventory.dto';
import { Inventory } from '@inventory/entities/inventory.entity';
import { InventoryBalance } from '@inventory/entities/inventoryBalance.entitiy';
import { InventoryBalanceQueryDto } from '@inventory/dto/inventory-query.dto';
import { PaginatedInventoryBalanceResponseDto } from '@inventory/dto/paginated-inventory.response.dto';

@ApiTags('재고 거래(입출고) 관리')
@Controller('inventories')
@UsePipes(new ValidationPipe({ transform: true }))
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '재고 입출고 처리',
    description:
      '제품의 입고 또는 출고를 처리합니다. 유통기한이 없는 경우 생략할 수 있습니다.',
  })
  @ApiResponse({
    status: 201,
    description: '재고 거래가 성공적으로 생성되었습니다.',
    type: Inventory,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 입력 데이터 또는 재고 부족',
  })
  async create(
    @Body() createInventoryDto: CreateInventoryDto,
  ): Promise<Inventory> {
    return await this.inventoryService.createTransaction(createInventoryDto);
  }

  @Get()
  @ApiOperation({
    summary: '재고 거래 내역 조회',
    description:
      '페이지네이션과 필터링(제품 코드, 로트 번호, 유통기한 범위)을 통해 재고 거래 내역을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '재고 거래 내역 조회 성공',
    type: PaginatedInventoryBalanceResponseDto,
  })
  async findAll(
    @Query() query: InventoryBalanceQueryDto,
  ): Promise<PaginatedInventoryBalanceResponseDto> {
    return await this.inventoryService.findAllWithPagination(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: '특정 재고 거래 조회',
    description: 'ID로 특정 재고 거래 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '재고 거래 ID' })
  @ApiResponse({
    status: 200,
    description: '재고 거래 조회 성공',
    type: Inventory,
  })
  @ApiResponse({
    status: 404,
    description: '재고 거래를 찾을 수 없음',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Inventory> {
    return await this.inventoryService.findOne(id);
  }
}

@ApiTags('재고 상태(잔량) 관리')
@Controller('inventory-balances')
@UsePipes(new ValidationPipe({ transform: true }))
export class InventoryBalanceController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':productCode')
  @ApiOperation({
    summary: '제품별 재고 상태 조회',
    description:
      '특정 제품의 재고 상태(잔량)를 조회합니다. 로트 번호 및 유통기한으로 필터링 가능합니다.',
  })
  @ApiParam({ name: 'productCode', description: '제품 코드' })
  @ApiQuery({ name: 'lotNumber', description: '로트 번호', required: false })
  @ApiQuery({
    name: 'expirationDateFrom',
    description: '유통기한 시작일 (YYYY-MM-DD)',
    required: false,
  })
  @ApiQuery({
    name: 'expirationDateTo',
    description: '유통기한 종료일 (YYYY-MM-DD)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '재고 상태 조회 성공',
    type: InventoryBalance, // 재고 상태 엔티티 반환 타입
  })
  async getBalance(
    @Param('productCode') productCode: string,
    @Query('lotNumber') lotNumber?: string,
    @Query('expirationDateFrom') expirationDateFrom?: string,
    @Query('expirationDateTo') expirationDateTo?: string,
  ): Promise<InventoryBalance[]> {
    return await this.inventoryService.getInventoryBalance(
      productCode,
      lotNumber,
      expirationDateFrom,
      expirationDateTo,
    );
  }

  @Get('all/:productCode')
  @ApiOperation({
    summary: '제품별 전체 재고 상태 조회',
    description: '제품의 모든 로트/유통기한별 재고 상태를 조회합니다.',
  })
  @ApiParam({ name: 'productCode', description: '제품 코드' })
  @ApiResponse({
    status: 200,
    description: '전체 재고 상태 조회 성공',
    type: [InventoryBalance],
  })
  async getBalances(
    @Param('productCode') productCode: string,
  ): Promise<InventoryBalance[]> {
    return await this.inventoryService.getInventoryBalances(productCode);
  }

  @Get('expiring/soon')
  @ApiOperation({
    summary: '유통기한 임박 재고 조회',
    description:
      '지정된 일수(days) 내에 유통기한이 만료되는 재고 상태를 조회합니다.',
  })
  @ApiQuery({
    name: 'days',
    description: '유통기한 임박 기준 일수',
    required: false,
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: '유통기한 임박 재고 조회 성공',
    type: [InventoryBalance],
  })
  async getExpiringSoon(
    @Query('days') days?: number,
  ): Promise<InventoryBalance[]> {
    return await this.inventoryService.getExpiringSoon(days);
  }
}
