import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthStrategy } from './auth.strategy';

@Module({
    imports: [
        PassportModule,
    ],
    providers: [
        AuthStrategy,
    ],
    exports: [],
})
export class AuthModule {}
