export function getPaginationParams(page: number, limit: number) {
    const take = limit;
    const skip = (page - 1) * limit;
    return { skip, take };
}
export function getPaginationMeta(total: number, page: number, limit: number) {
    return {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        perPage: limit,
    };
}
export function getPaginatedResponse<T>(items: T[], total: number, page: number, limit: number) {
    return {
        items,
        meta: getPaginationMeta(total, page, limit),
    };
}