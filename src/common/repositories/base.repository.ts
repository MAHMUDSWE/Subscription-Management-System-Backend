import { EntityManager, EntityTarget, Repository, UpdateResult } from 'typeorm';

export class BaseRepository<T> extends Repository<T> {
    constructor(
        entity: EntityTarget<T>,
        entityManager: EntityManager,
    ) {
        super(entity, entityManager);
    }

    async findOneByIdOrFail(id: string): Promise<T> {
        const entity = await this.findOne({ where: { id } as any });
        if (!entity) {
            throw new Error('Entity not found');
        }
        return entity;
    }

    async softDelete(id: string): Promise<UpdateResult> {
        return this.update(id, { isActive: false } as any);
    }
}