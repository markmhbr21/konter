import { Injectable, OnModuleInit } from '@nestjs/common'; // Ditambahkan OnModuleInit di sini
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['branch'],
    });
  }

  async createAdmin(
    username: string,
    passwordPlain: string,
    name: string,
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const admin = this.usersRepository.create({
      username,
      passwordHash,
      name,
      role: UserRole.ADMIN,
    });
    return this.usersRepository.save(admin);
  }

  async createEmployee(
    username: string,
    passwordPlain: string,
    name: string,
    branchId?: number,
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const employee = this.usersRepository.create({
      username,
      passwordHash,
      name,
      role: UserRole.EMPLOYEE,
      branch: branchId ? ({ id: branchId } as any) : null,
    });
    return this.usersRepository.save(employee);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['branch'] });
  }

  async update(id: number, data: any): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');

    if (data.password) {
      user.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.username) user.username = data.username;
    if (data.name) user.name = data.name;
    if (data.branchId !== undefined) {
      user.branch = data.branchId ? ({ id: data.branchId } as any) : null;
    }
    if (data.profileImage !== undefined) user.profileImage = data.profileImage;
    if (data.theme !== undefined) user.theme = data.theme;
    if (data.language !== undefined) user.language = data.language;

    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Fungsi Seeder Otomatis
  async onModuleInit() {
    const adminExists = await this.usersRepository.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const admin = this.usersRepository.create({
        name: 'Administrator',
        username: 'admin',
        passwordHash: hashedPassword,
        role: UserRole.ADMIN, // Diubah dari 'admin' menjadi UserRole.ADMIN agar sesuai enum
      });
      await this.usersRepository.save(admin);
      console.log('✅ Admin user created successfully');
    }
  }
}