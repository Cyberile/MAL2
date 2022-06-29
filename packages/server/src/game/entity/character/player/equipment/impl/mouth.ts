import Equipment from '../equipment';

import { Modules } from '@kaetram/common/network';

export default class Mouth extends Equipment {
    public constructor(key = '', count = -1, ability = -1, abilityLevel = -1) {
        super(Modules.Equipment.Mouth, key, count, ability, abilityLevel);
    }
}
