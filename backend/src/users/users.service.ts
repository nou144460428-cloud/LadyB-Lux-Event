import { Injectable, NotFoundException } from '@nestjs/common';
import { createPrismaClient } from '../prisma/prisma-client-options';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  private prisma: any = createPrismaClient() as any;

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateRole(id: string, role: Role) {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }
}
