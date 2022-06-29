import _ from 'lodash';

import log from '@kaetram/common/util/log';
import { Modules } from '@kaetram/common/network';
import { EquipmentData, SerializedEquipment } from '@kaetram/common/types/equipment';

import Player from './player';

import Equipment from './equipment/equipment';

import Eyes from './equipment/impl/eyes';
import Hat from './equipment/impl/hat';
import Clothes from './equipment/impl/clothes';
import Mouth from './equipment/impl/mouth';
import Fur from './equipment/impl/fur';
import Ears from './equipment/impl/ears';

import Item from '../../objects/item';

export default class Equipments {
    private eyes: Eyes = new Eyes();
    private hat: Hat = new Hat();
    private clothes: Clothes = new Clothes();
    private mouth: Mouth = new Mouth();
    private fur: Fur = new Fur();
    private ears: Ears = new Ears();

    // Store all equipments for parsing.
    // Make sure these are in the order of the enum.
    private equipments: Equipment[] = [
        this.eyes,
        this.hat,
        this.clothes,
        this.mouth,
        this.fur,
        this.ears
    ];

    private loadCallback?: () => void;
    private equipCallback?: (equipment: Equipment) => void;
    private unequipCallback?: (type: Modules.Equipment) => void;

    public constructor(private player: Player) {}

    /**
     * Takes the equipment data stored in the database and 'de-serializes' it
     * by updating each individual equipment.
     * @param equipmentInfo The information about equipments from the database.
     */

    public load(equipmentInfo: EquipmentData[]): void {
        _.each(equipmentInfo, (info: EquipmentData) => {
            let equipment = this.getEquipment(info.type);

            if (!equipment) return;
            if (!info.key) return; // Skip if the item is already null

            equipment.update(
                new Item(info.key, -1, -1, true, info.count, info.ability, info.abilityLevel)
            );
        });

        this.loadCallback?.();

        this.player.sync();
    }

    /**
     * Takes information about an item and equips it onto the player. It figures
     * out what equipment type it is, and updates that equipment's information.
     */

    public equip(item: Item): void {
        if (!item) return log.warning('Tried to equip something mysterious.');

        let type = item.getEquipmentType(),
            equipment = this.getEquipment(type);

        if (!equipment) return;

        if (!equipment.isEmpty())
            this.player.inventory.add(
                new Item(
                    equipment.key,
                    -1,
                    -1,
                    true,
                    equipment.count,
                    equipment.ability,
                    equipment.abilityLevel
                )
            );

        equipment.update(item);

        this.equipCallback?.(equipment);
    }

    /**
     * Finds the equipment type passed and attempts to unequip if there is
     * enough space in the inventory.
     * @param type The equipment we are attempting to unequip.
     */

    public unequip(type: Modules.Equipment): void {
        if (!this.player.inventory.hasSpace())
            return this.player.notify('You do not have enough space in your inventory.');

        let equipment = this.getEquipment(type);

        this.player.inventory.add(
            new Item(
                equipment.key,
                -1,
                -1,
                true,
                equipment.count,
                equipment.ability,
                equipment.abilityLevel
            )
        );

        equipment.empty();

        this.unequipCallback?.(type);
    }

    /**
     * Each equipment is organized in the same order as the `Modules.Equipment`
     * enum. As such, we use the type to pick from the array. We must make sure
     * that any new equipments that are added have to follow the SAME order
     * as the enumeration.
     * @param type The type of equipment from Modules.
     * @returns The equipment in the index.
     */

    public getEquipment(type: Modules.Equipment): Equipment {
        return this.equipments[type];
    }

    /**
     * Supplemental getters for more easily accessing equipments.
     * Instead of having to write `player.equipment.getEquipment(Modules.Equipment.Fur)`
     * you can just use these getters -> `player.equipment.getFur()`
     */

    /**
     * Grabs the eyes equipment of the player.
     * @returns Eyes equipment type.
     */

    public getEyes(): Eyes {
        return this.getEquipment(Modules.Equipment.Eyes);
    }

    /**
     * Grabs the hat equipment of the player.
     * @returns Hat equipment type.
     */

    public getHat(): Hat {
        return this.getEquipment(Modules.Equipment.Hat);
    }

    /**
     * Grabs the clothes equipment of the player.
     * @returns Clothes equipment type.
     */

    public getClothes(): Clothes {
        return this.getEquipment(Modules.Equipment.Clothes);
    }

    /**
     * Grabs the mouth equipment of the player.
     * @returns Mouth equipment type.
     */

    public getMouth(): Mouth {
        return this.getEquipment(Modules.Equipment.Mouth);
    }

    /**
     * Grabs the fur equipment of the player.
     * @returns Fur equipment type.
     */

    public getFur(): Fur {
        return this.getEquipment(Modules.Equipment.Fur);
    }

    /**
     * Grabs the ears equipment for the player.
     * @returns Ears equipment object.
     */

    public getEars(): Ears {
        return this.getEquipment(Modules.Equipment.Ears);
    }

    /**
     * Goes through each one of our equipments and serializes it. It extracts
     * cruical information, such as the id, count, ability, and abilityLevel.
     * @returns A serialized version of the equipment information.
     */

    public serialize(): SerializedEquipment {
        let equipments: EquipmentData[] = [];

        this.forEachEquipment((equipment: Equipment) => equipments.push(equipment.serialize()));

        // Store in an object so that it gets saved into Database faster.
        return { equipments };
    }

    /**
     * Parses through each equipment in the equipments array.
     * @param callback Calls back each individual equipment.
     */

    public forEachEquipment(callback: (equipment: Equipment) => void): void {
        _.each(this.equipments, callback);
    }

    /**
     * Callback signal for when the equipment is loaded.
     */

    public onLoaded(callback: () => void): void {
        this.loadCallback = callback;
    }

    /**
     * Callback signal for when an item is equipped.
     * @param callback The equipment slot that we just updated.
     */

    public onEquip(callback: (equipment: Equipment) => void): void {
        this.equipCallback = callback;
    }

    /**
     * Callback for when an equipment is removed.
     * @param callback The equipment type we are removing.
     */

    public onUnequip(callback: (type: Modules.Equipment) => void): void {
        this.unequipCallback = callback;
    }
}
