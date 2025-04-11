import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResponse, PaginationDto } from 'src/common/dtos/pagination.dto';
import { getPaginatedResponse, getPaginationParams } from 'src/common/utils/pagination.util';
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

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Organization>> {
    const { page, limit } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    const [items, total] = await this.organizationRepository.findPaginatedOrganizations(skip, take);

    return getPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOrganizationById(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findByOwner(ownerId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Organization>> {
    const { page, limit } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    const [items, total] = await this.organizationRepository.findOrganizationsByOwner(ownerId, skip, take);
    return getPaginatedResponse(items, total, page, limit);
  }
}