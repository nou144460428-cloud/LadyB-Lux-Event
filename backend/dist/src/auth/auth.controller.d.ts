import { AuthService } from './auth.service';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { AdminRegisterDto } from './admin-register.dto';
import { AdminBootstrapDto } from './admin-bootstrap.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: any;
    }>;
    adminRegister(dto: AdminRegisterDto): Promise<{
        access_token: string;
        user: any;
    }>;
    adminBootstrap(dto: AdminBootstrapDto): Promise<{
        access_token: string;
        user: any;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
    adminLogin(dto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
}
