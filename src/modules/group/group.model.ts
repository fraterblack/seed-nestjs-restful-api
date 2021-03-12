import { BelongsToMany, Column, Index, Table } from 'sequelize-typescript';

import { BaseModel } from '../../core/database/orm/base-model';
import { RegisterGroup } from './../register/register-group.model';
import { Register } from './../register/register.model';

@Table({ tableName: 'groups' })
export class Group extends BaseModel<Group> {
    @Index
    @Column
    name: string;

    @Column
    active: boolean;

    @BelongsToMany(() => Group, () => RegisterGroup)
    registries?: Array<Register & { RegisterGroup: RegisterGroup }>;
}
