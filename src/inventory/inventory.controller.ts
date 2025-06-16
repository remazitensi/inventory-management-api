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
import { QueryInventoryDto } from '@inventory/dto/query-inventory.dto';
import { Inventory } from '@inventory/entities/inventory.entity';

@ApiTags('재고 관리')
@Controller('inventories')
@UsePipes(new ValidationPipe({ transform: true }))
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '재고 입출고 처리',
    description:
      '제품의 입고 또는 출고를 처리합니다. 유통기한과 로트 번호를 포함할 수 있습니다.',
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
      '페이지네이션과 필터링을 지원하는 재고 거래 내역을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '재고 거래 내역 조회 성공',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Inventory' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(@Query() queryDto: QueryInventoryDto) {
    return await this.inventoryService.findAll(queryDto);
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

  @Get('balance/:productCode')
  @ApiOperation({
    summary: '제품별 재고 잔량 조회',
    description:
      '특정 제품의 현재 재고 잔량을 로트별, 유통기한별로 조회합니다.',
  })
  @ApiParam({ name: 'productCode', description: '제품 코드' })
  @ApiQuery({ name: 'lotNumber', description: '로트 번호', required: false })
  @ApiQuery({
    name: 'expirationDate',
    description: '유통기한 (YYYY-MM-DD)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '재고 잔량 조회 성공',
    schema: {
      type: 'object',
      properties: {
        productCode: { type: 'string' },
        lotNumber: { type: 'string', nullable: true },
        expirationDate: { type: 'string', nullable: true },
        currentQuantity: { type: 'number' },
      },
    },
  })
  async getBalance(
    @Param('productCode') productCode: string,
    @Query('lotNumber') lotNumber?: string,
    @Query('expirationDate') expirationDate?: string,
  ) {
    return await this.inventoryService.getInventoryBalance(
      productCode,
      lotNumber,
      expirationDate,
    );
  }

  @Get('balances/:productCode')
  @ApiOperation({
    summary: '제품별 전체 재고 현황 조회',
    description: '특정 제품의 모든 로트별, 유통기한별 재고 현황을 조회합니다.',
  })
  @ApiParam({ name: 'productCode', description: '제품 코드' })
  @ApiResponse({
    status: 200,
    description: '전체 재고 현황 조회 성공',
    schema: {
      type: 'object',
      properties: {
        productCode: { type: 'string' },
        balances: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lotNumber: { type: 'string', nullable: true },
              expirationDate: { type: 'string', nullable: true },
              currentQuantity: { type: 'number' },
            },
          },
        },
        totalQuantity: { type: 'number' },
      },
    },
  })
  async getBalances(@Param('productCode') productCode: string) {
    return await this.inventoryService.getInventoryBalances(productCode);
  }

  @Get('expiring/soon')
  @ApiOperation({
    summary: '유통기한 임박 재고 조회',
    description: '지정된 일수 내에 유통기한이 만료되는 재고를 조회합니다.',
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
    schema: {
      type: 'object',
      properties: {
        threshold: { type: 'number' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productCode: { type: 'string' },
              lotNumber: { type: 'string', nullable: true },
              expirationDate: { type: 'string' },
              currentQuantity: { type: 'number' },
              daysUntilExpiration: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getExpiringSoon(@Query('days') days?: number) {
    return await this.inventoryService.getExpiringSoon(days);
  }
}
