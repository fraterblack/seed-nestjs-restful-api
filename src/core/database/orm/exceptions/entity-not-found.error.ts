export class EntityNotFoundError extends Error {
    constructor(entityClass: string, criteria: any) {
        let parsedCriteria: any;

        try {
            parsedCriteria = JSON.stringify(criteria);
        } catch (error) {
            parsedCriteria = null;
        }

        super(`Não foi encontrado uma entidade "${entityClass}" através da criteria: ${parsedCriteria}`);
    }
}
