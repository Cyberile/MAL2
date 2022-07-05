import Packet from '../packet';
import { Packets } from '@kaetram/common/network';

export default class NoPath extends Packet {
    public constructor(status: boolean) {
        super(Packets.NoPath, undefined, status);
    }
}
