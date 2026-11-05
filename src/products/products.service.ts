import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {

  constructor( private readonly prisma: PrismaService,) {}


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

   async findAll(){
    return this.prisma.product.findMany(); 
   }

   async create ( createProductDto: CreateProductDto){
     return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        price: createProductDto.price,
      },
     })
  }
   
  async findOne (id:number){
    const product = await this.prisma.product.findUnique({
      where : { id:id},
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async remove (id:number){
    const product = await this.prisma.product.delete({
      where : { id:id},
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
  
}
