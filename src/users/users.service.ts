import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async create(user: Partial<User>): Promise<User> {
    const entity = this.usersRepo.create(user);
    return this.usersRepo.save(entity);
  }

  async setRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const hash = await import('bcrypt').then(b => b.hash(refreshToken, 10));
    await this.usersRepo.update(userId, { refreshTokenHash: hash });
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.usersRepo.update(userId, { refreshTokenHash: null });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }
}


