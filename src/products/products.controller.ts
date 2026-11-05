import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    findAll() { 
        return this.productsService.findAll();
    }

    @Post()
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(Number(id), updateProductDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(Number(id));
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(Number(id));
    }
}