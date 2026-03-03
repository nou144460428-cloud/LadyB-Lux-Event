import { UsersService } from './users.service';
import { Role } from '@prisma/client';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    me(req: any): Promise<any>;
    listUsers(): Promise<any>;
    updateRole(id: string, body: {
        role: Role;
    }): Promise<any>;
}
