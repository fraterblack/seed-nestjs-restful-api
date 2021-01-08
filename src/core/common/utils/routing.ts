import config from '../../configuration/config';

export class RoutingTable {
    static readonly CORE = config.get('CORE_SERVICE_ENDPOINT');
}
