"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    jwt;
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    constructor(jwt) {
        this.jwt = jwt;
    }
    async register(dto) {
        if (dto.role === client_1.Role.ADMIN || dto.role === client_1.Role.STAFF) {
            throw new common_1.ForbiddenException('Admin/staff registration is restricted');
        }
        const accountType = this.resolveAccountTypeForRegistration(dto);
        this.validateDecoratorContacts(dto, accountType);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
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
    async adminRegister(dto) {
        const configuredSecret = process.env.ADMIN_REGISTRATION_SECRET;
        if (!configuredSecret) {
            throw new common_1.InternalServerErrorException('Admin registration is not configured');
        }
        if (dto.adminSecret !== configuredSecret) {
            throw new common_1.ForbiddenException('Invalid admin registration secret');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashed,
                role: client_1.Role.ADMIN,
                accountType: client_1.AccountType.ADMIN,
            },
        });
        return this.signToken(user);
    }
    async adminBootstrap(dto) {
        const configuredSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
        if (!configuredSecret) {
            throw new common_1.InternalServerErrorException('Admin bootstrap is not configured');
        }
        if (dto.bootstrapSecret !== configuredSecret) {
            throw new common_1.ForbiddenException('Invalid admin bootstrap secret');
        }
        const adminCount = await this.prisma.user.count({
            where: { role: client_1.Role.ADMIN },
        });
        if (adminCount > 0) {
            throw new common_1.ForbiddenException('Admin bootstrap is disabled after first admin creation');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashed,
                role: client_1.Role.ADMIN,
                accountType: client_1.AccountType.ADMIN,
            },
        });
        return this.signToken(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.signToken(user);
    }
    async adminLogin(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.signToken(user);
    }
    signToken(user) {
        const payload = { sub: user.id, role: user.role };
        return {
            access_token: this.jwt.sign(payload),
            user,
        };
    }
    resolveAccountTypeForRegistration(dto) {
        if (dto.role === client_1.Role.CUSTOMER) {
            if (dto.accountType && dto.accountType !== client_1.AccountType.CUSTOMER) {
                throw new common_1.ForbiddenException('Customer registration must use CUSTOMER account type');
            }
            return client_1.AccountType.CUSTOMER;
        }
        if (dto.role === client_1.Role.VENDOR) {
            if (!dto.accountType) {
                return client_1.AccountType.VENDOR;
            }
            if (dto.accountType !== client_1.AccountType.DECORATOR &&
                dto.accountType !== client_1.AccountType.VENDOR) {
                throw new common_1.ForbiddenException('Vendor registration must be DECORATOR or VENDOR account type');
            }
            return dto.accountType;
        }
        throw new common_1.ForbiddenException('Unsupported registration role');
    }
    validateDecoratorContacts(dto, accountType) {
        if (accountType !== client_1.AccountType.DECORATOR) {
            return;
        }
        if (!dto.phone?.trim()) {
            throw new common_1.ForbiddenException('Decorator phone contact is required for registration');
        }
        if (!dto.nextOfKinName?.trim() || !dto.nextOfKinPhone?.trim()) {
            throw new common_1.ForbiddenException('Decorator next-of-kin name and phone are required for registration');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map