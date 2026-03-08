import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from './user.entity';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('employee')
  async createEmployee(@Body() body: any) {
    // Pada skenario nyata, pastikan role caller = ADMIN
    return this.usersService.createEmployee(
      body.username,
      body.password,
      body.name,
      body.branchId,
    );
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('update/:id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(+id, body);
  }

  @Post('delete/:id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
