import { Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    findById(id: string): Promise<any>;
    findAll(): Promise<any>;
    updateRole(id: string, role: Role): Promise<any>;
}
