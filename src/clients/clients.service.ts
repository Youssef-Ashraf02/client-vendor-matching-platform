import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepo: Repository<Client>,
  ) {}

  async findById(id: number): Promise<Client | null> {
    return this.clientsRepo.findOne({ 
      where: { id },
      relations: ['ownerUser', 'projects']
    });
  }

  async findByOwnerUserId(ownerUserId: number): Promise<Client[]> {
    return this.clientsRepo.find({ 
      where: { ownerUserId },
      relations: ['projects']
    });
  }

  async create(client: Partial<Client>): Promise<Client> {
    const entity = this.clientsRepo.create(client);
    return this.clientsRepo.save(entity);
  }

  async update(id: number, updates: Partial<Client>): Promise<Client> {
    await this.clientsRepo.update(id, updates);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Client with id ${id} not found`);
    }
    return updated;
  }
}
