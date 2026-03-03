import { Role, AccountType } from '@prisma/client';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role: Role;
    accountType?: AccountType;
    phone?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
    nextOfKinRelationship?: string;
}
