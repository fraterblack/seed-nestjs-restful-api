import { Inject, Injectable } from '@nestjs/common';

import { BaseRepository } from '../../core/database/orm/base-repository';
import { IRelations } from './../../core/database/orm/interfaces/relations.interface';
import { Group } from './group.model';

@Injectable()
export class GroupRepository extends BaseRepository<Group> {
    protected relations: IRelations = {};

    protected defaultOrder = [['name', 'asc']];

    constructor(@Inject('GroupModel') private readonly groupModel: typeof Group) {
        super(groupModel);
    }
}
