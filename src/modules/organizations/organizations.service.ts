import { Injectable, NotFoundException } from '@nestjs/common';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationRepository } from './repositories/organization.repository';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) { }

  async create(createOrganizationDto: CreateOrganizationDto, owner: User): Promise<Organization> {
    return this.organizationRepository.createOrganization({
      ...createOrganizationDto,
      owner,
    });
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.findAllOrganizations();
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOrganizationById(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findByOwner(ownerId: string): Promise<Organization[]> {
    return this.organizationRepository.findOrganizationsByOwner(ownerId);
  }
}