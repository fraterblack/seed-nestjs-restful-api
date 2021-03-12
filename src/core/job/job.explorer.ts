import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { ContextId, InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';

import { IJobEvent } from './interfaces/job-event.interface';
import { JobMetadataAccessor } from './job-metadata.accessor';

@Injectable()
export class JobExplorer implements OnModuleInit {
    private readonly injector = new Injector();
    private handlers = new Map<string, CallableFunction>();

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataAccessor: JobMetadataAccessor,
        private readonly metadataScanner: MetadataScanner,
    ) { }

    onModuleInit() {
        this.explore();
    }

    explore() {
        const providers: InstanceWrapper[] = this.discoveryService
            .getProviders()
            .filter((wrapper: InstanceWrapper) =>
                this.metadataAccessor.isJobComponent(wrapper.metatype),
            );

        providers.forEach((wrapper: InstanceWrapper) => {
            const { instance } = wrapper;
            const isRequestScoped = !wrapper.isDependencyTreeStatic();

            this.metadataScanner.scanFromPrototype(
                instance,
                Object.getPrototypeOf(instance),
                (key: string) => {
                    if (this.metadataAccessor.isDispatcher(instance[key])) {
                        const metadata = this.metadataAccessor.getDispatchMetadata(
                            instance[key],
                        );

                        this.handleProcessor(
                            instance,
                            key,
                            wrapper.host,
                            isRequestScoped,
                            metadata,
                        );
                    }
                },
            );
        });
    }

    handleProcessor(
        instance: object,
        key: string,
        moduleRef: Module,
        isRequestScoped: boolean,
        options?: { event: IJobEvent },
    ) {
        if (isRequestScoped) {
            const callback: CallableFunction = async (
                ...args: unknown[]
            ) => {
                const contextInstance = await this.injector.loadPerContext(
                    instance,
                    moduleRef,
                    moduleRef.providers,
                    args[2] as ContextId,
                );
                return contextInstance[key].call(contextInstance, ...args);
            };

            this.bind(callback, (options.event as CallableFunction).name);
        } else {
            throw new Error('Job in non Request Scope is not implemented');
        }
    }

    get(event: IJobEvent): CallableFunction {
        const eventName = this.getEventName(event as any);
        return this.handlers.get(eventName);
    }

    private bind(handler: CallableFunction, name: string) {
        this.handlers.set(name, handler);
    }

    private getEventName(event: IJobEvent): string {
        const { constructor } = Object.getPrototypeOf(event);
        return constructor.name as string;
    }
}
