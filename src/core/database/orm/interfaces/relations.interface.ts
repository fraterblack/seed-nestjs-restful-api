export interface INestedRelations {
    model: any;
    nested: any | INestedRelations;
}

export interface IRelations {
    [field: string]: any | INestedRelations;
}
