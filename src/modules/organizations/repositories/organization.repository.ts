import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Organization } from '../../../entities/organization.entity';

@Injectable()
export class OrganizationRepository extends Repository<Organization> {
    constructor(private dataSource: DataSource) {
        super(Organization, dataSource.createEntityManager());
    }

    async createOrganization(organizationData: Partial<Organization>): Promise<Organization> {
        const organization = this.create(organizationData);
        return this.save(organization);
    }

    async findPaginatedOrganizations(skip: number, take: number): Promise<[Organization[], number]> {
        return this.findAndCount({
            skip,
            take,
            relations: ['owner', 'subscriptions'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOrganizationById(id: string): Promise<Organization | null> {
        return this.findOne({
            where: { id },
            relations: ['owner', 'subscriptions'],
        });
    }

    async findOrganizationsByOwner(ownerId: string, skip: number, take: number): Promise<[Organization[], number]> {
        return this.findAndCount({
            where: { owner: { id: ownerId } },
            relations: ['subscriptions'],
            skip,
            take,
            order: { createdAt: 'DESC' },
        });
    }
}