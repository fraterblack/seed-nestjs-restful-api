export interface IQueryResponse<T> {
    results: T[];
    total: number;
    page: number;
    limit?: number;
}
