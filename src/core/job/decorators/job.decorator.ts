import { SetMetadata } from '@nestjs/common';

import { JOB_JOB } from '../job.constant';

export function Job(): ClassDecorator;
export function Job(name?: string): ClassDecorator {
  const options = name && typeof name === 'object' ? name : { name };

  return (target: CallableFunction) => {
    SetMetadata(JOB_JOB, options)(target);
  };
}
