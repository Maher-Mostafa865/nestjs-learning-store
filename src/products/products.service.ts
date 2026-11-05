import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {

  constructor( private readonly prisma: PrismaService, ) {}


   private products = [
    {
        id: 1,
        name: 'Laptop',
        price: 25000,
    },
    {
        id: 2,
        name: 'Keyboard',
        price: 1500,
    },
    {
        id: 3,
        name: 'Mouse',
        price: 700,
    },
   ]

   findAll(){
    return this.products; 
   }

   create ( createProductDto: CreateProductDto){
    const product = {
      id: this.products.length + 1,
      ...createProductDto,
    }

    this.products.push(product);
    return product;
   }

   remove(id: number) {
    const productIndex = this.products.findIndex(
      (product) => product.id === id,
    );
  
    if (productIndex === -1) {
      throw new NotFoundException(
        `Product with ID ${id} not found`,
      );
    }
  
    this.products.splice(productIndex, 1);
  
    return {
      message: 'Product deleted successfully',
    };
  }
}
