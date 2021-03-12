import { CacheModule, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ContextModule } from '../../core/context/context.module';
import { GroupV1Controller } from './group-v1.controller';
import { Group } from './group.model';
import { GroupRepository } from './group.repository';
import { GroupService } from './group.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Group]),
        ContextModule,
        CacheModule.register(),
    ],
    controllers: [
        GroupV1Controller,
    ],
    providers: [
        GroupRepository,
        GroupService,
        {
            provide: 'GroupModel',
            useValue: Group,
        },
    ],
    exports: [
        GroupRepository,
        GroupService,
        SequelizeModule,
    ],
})
export class GroupModule { }
