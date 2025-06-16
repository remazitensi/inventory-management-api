import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ProductService } from '@products/product.service';
import { CreateProductDto, UpdateProductDto } from '@products/dto/product.dto';
import { ApiResponseDto } from '@common/dto/api-response';
import { Product } from '@products/entities/product.entity';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import {
  ProductListResponseDto,
  ProductResponseDto,
} from './dto/product-response.dto';

@ApiTags('제품 관리')
@Controller('products')
@UseFilters(GlobalExceptionFilter)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({
    summary: '제품 등록',
    description: '새로운 제품을 등록합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '제품 등록 성공',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiConflictResponse({ description: '제품 코드가 이미 존재함' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ApiResponseDto<Product>> {
    const product = await this.productService.createProduct(createProductDto);
    return {
      success: true,
      message: '제품이 성공적으로 등록되었습니다.',
      data: product,
    };
  }

  @Get()
  @ApiOperation({
    summary: '제품 목록 조회',
    description: '등록된 전체 제품 목록을 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '제품 목록 조회 성공',
    type: ProductListResponseDto,
  })
  async findAllProducts(): Promise<ProductListResponseDto> {
    const result = await this.productService.findAllProducts();
    return {
      success: true,
      message: '제품 목록을 성공적으로 조회했습니다.',
      data: result,
    };
  }

  @Get('active')
  @ApiOperation({
    summary: '활성 제품 목록 조회',
    description: '활성화된 제품만 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '활성 제품 조회 성공',
    type: ProductListResponseDto,
  })
  async getActiveProducts(): Promise<ProductListResponseDto> {
    const products = await this.productService.getActiveProducts();
    return {
      success: true,
      message: '활성 제품 목록을 성공적으로 조회했습니다.',
      data: products,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '제품 상세 조회',
    description: '제품 ID로 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '제품 조회 성공',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({ description: '해당 ID의 제품 없음' })
  async findProductById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<Product>> {
    const product = await this.productService.findProductById(id);
    return {
      success: true,
      message: '제품 정보를 성공적으로 조회했습니다.',
      data: product,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: '제품 수정',
    description: '제품 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '제품 수정 성공',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({ description: '해당 제품 없음' })
  @ApiBadRequestResponse({ description: '요청 데이터가 유효하지 않음' })
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ApiResponseDto<Product>> {
    const product = await this.productService.updateProduct(
      id,
      updateProductDto,
    );
    return {
      success: true,
      message: '제품 정보가 성공적으로 수정되었습니다.',
      data: product,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: '제품 삭제',
    description:
      '제품을 삭제합니다. 재고 기록이 존재하는 경우 비활성화 처리됩니다.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '제품 삭제 성공',
    type: ApiResponseDto,
  })
  @ApiNotFoundResponse({ description: '해당 제품 없음' })
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<null>> {
    await this.productService.deleteProduct(id);
    return {
      success: true,
      message: '제품이 성공적으로 삭제되었습니다.',
    };
  }
}
