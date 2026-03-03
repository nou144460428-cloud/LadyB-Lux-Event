import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { AdminRegisterDto } from './admin-register.dto';
import { AdminBootstrapDto } from './admin-bootstrap.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('admin/register')
  adminRegister(@Body() dto: AdminRegisterDto) {
    return this.authService.adminRegister(dto);
  }

  @Post('admin/bootstrap')
  adminBootstrap(@Body() dto: AdminBootstrapDto) {
    return this.authService.adminBootstrap(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admin/login')
  adminLogin(@Body() dto: LoginDto) {
    return this.authService.adminLogin(dto);
  }
}
