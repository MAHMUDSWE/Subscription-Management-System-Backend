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

    async findAllOrganizations(): Promise<Organization[]> {
        return this.find({
            relations: ['owner', 'subscriptions'],
        });
    }

    async findOrganizationById(id: string): Promise<Organization | null> {
        return this.findOne({
            where: { id },
            relations: ['owner', 'subscriptions'],
        });
    }

    async findOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
        return this.find({
            where: { owner: { id: ownerId } },
            relations: ['subscriptions'],
        });
    }
}