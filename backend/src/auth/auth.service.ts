// auth.service.ts
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createPrismaClient } from '../prisma/prisma-client-options';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { AdminRegisterDto } from './admin-register.dto';
import { AdminBootstrapDto } from './admin-bootstrap.dto';
import { Role, AccountType } from '@prisma/client';

@Injectable()
export class AuthService {
  private prisma: any = createPrismaClient() as any;

  constructor(private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    if (dto.role === Role.ADMIN || dto.role === Role.STAFF) {
      throw new ForbiddenException('Admin/staff registration is restricted');
    }

    const accountType = this.resolveAccountTypeForRegistration(dto);
    this.validateDecoratorContacts(dto, accountType);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: dto.role,
        accountType,
        phone: dto.phone || null,
        nextOfKinName: dto.nextOfKinName || null,
        nextOfKinPhone: dto.nextOfKinPhone || null,
        nextOfKinRelationship: dto.nextOfKinRelationship || null,
      },
    });

    return this.signToken(user);
  }

  async adminRegister(dto: AdminRegisterDto) {
    const configuredSecret = process.env.ADMIN_REGISTRATION_SECRET;

    if (!configuredSecret) {
      throw new InternalServerErrorException(
        'Admin registration is not configured',
      );
    }

    if (dto.adminSecret !== configuredSecret) {
      throw new ForbiddenException('Invalid admin registration secret');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: Role.ADMIN,
        accountType: AccountType.ADMIN,
      },
    });

    return this.signToken(user);
  }

  async adminBootstrap(dto: AdminBootstrapDto) {
    const configuredSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!configuredSecret) {
      throw new InternalServerErrorException(
        'Admin bootstrap is not configured',
      );
    }

    if (dto.bootstrapSecret !== configuredSecret) {
      throw new ForbiddenException('Invalid admin bootstrap secret');
    }

    const adminCount = await this.prisma.user.count({
      where: { role: Role.ADMIN },
    });
    if (adminCount > 0) {
      throw new ForbiddenException(
        'Admin bootstrap is disabled after first admin creation',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: Role.ADMIN,
        accountType: AccountType.ADMIN,
      },
    });

    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user);
  }

  async adminLogin(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return this.signToken(user);
  }

  private signToken(user: any) {
    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user,
    };
  }

  private resolveAccountTypeForRegistration(dto: RegisterDto): AccountType {
    if (dto.role === Role.CUSTOMER) {
      if (dto.accountType && dto.accountType !== AccountType.CUSTOMER) {
        throw new ForbiddenException(
          'Customer registration must use CUSTOMER account type',
        );
      }
      return AccountType.CUSTOMER;
    }

    if (dto.role === Role.VENDOR) {
      if (!dto.accountType) {
        return AccountType.VENDOR;
      }
      if (
        dto.accountType !== AccountType.DECORATOR &&
        dto.accountType !== AccountType.VENDOR
      ) {
        throw new ForbiddenException(
          'Vendor registration must be DECORATOR or VENDOR account type',
        );
      }
      return dto.accountType;
    }

    throw new ForbiddenException('Unsupported registration role');
  }

  private validateDecoratorContacts(dto: RegisterDto, accountType: AccountType) {
    if (accountType !== AccountType.DECORATOR) {
      return;
    }

    if (!dto.phone?.trim()) {
      throw new ForbiddenException(
        'Decorator phone contact is required for registration',
      );
    }
    if (!dto.nextOfKinName?.trim() || !dto.nextOfKinPhone?.trim()) {
      throw new ForbiddenException(
        'Decorator next-of-kin name and phone are required for registration',
      );
    }
  }
}
