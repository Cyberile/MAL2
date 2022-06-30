import Menu from '../../menu';
import Player from '../../../entity/character/player/player';

import Util from '../../../utils/util';
import { Modules } from '@kaetram/common/network';

type SelectCallback = (type: Modules.Equipment) => void;

export default class State extends Menu {
    // General player information.
    private name: HTMLElement = document.querySelector('#profile-name')!;
    private level: HTMLElement = document.querySelector('#profile-level')!;
    private experience: HTMLElement = document.querySelector('#profile-experience')!;

    // Equipment information
    private eyes: HTMLElement = document.querySelector('#eyes-slot')!;
    private hat: HTMLElement = document.querySelector('#hat-slot')!;
    private clothes: HTMLElement = document.querySelector('#clothes-slot')!;
    private mouth: HTMLElement = document.querySelector('#mouth-slot')!;
    private fur: HTMLElement = document.querySelector('#fur-slot')!;
    private ears: HTMLElement = document.querySelector('#ears-slot')!;

    private selectCallback?: SelectCallback;

    public constructor() {
        super('#state-page');

        this.eyes.addEventListener('click', () => this.selectCallback?.(Modules.Equipment.Eyes));
        this.hat.addEventListener('click', () => this.selectCallback?.(Modules.Equipment.Hat));
        this.clothes.addEventListener('click', () =>
            this.selectCallback?.(Modules.Equipment.Clothes)
        );
        this.mouth.addEventListener('click', () => this.selectCallback?.(Modules.Equipment.Mouth));
        this.fur.addEventListener('click', () => this.selectCallback?.(Modules.Equipment.Fur));
        this.ears.addEventListener('click', () => this.selectCallback?.(Modules.Equipment.Ears));
    }

    /**
     * Synchronizes the player data into its respective slots. Takes
     * the player's name, level, experience, and equipment and updates
     * the user interface accordingly.
     * @param player Player object we are synching to.
     */

    public override synchronize(player: Player): void {
        // Synchronize the player's general information
        this.name.textContent = player.name;
        this.level.textContent = `Level ${player.level}`;
        this.experience.textContent = `${player.experience}`;

        // Synchronize equipment data
        this.eyes.style.backgroundImage = Util.getImageURL(player.getEyes().key);
        this.hat.style.backgroundImage = Util.getImageURL(player.getHat().key);
        this.clothes.style.backgroundImage = Util.getImageURL(player.getClothes().key);
        this.mouth.style.backgroundImage = Util.getImageURL(player.getMouth().key);
        // Default green fur shouldn't be displayed in the equipment screen.
        this.fur.style.backgroundImage = Util.getImageURL(
            player.getFur().key === 'fur_green' ? '' : player.getFur().key
        );
        this.ears.style.backgroundImage = Util.getImageURL(player.getEars().key);
    }

    /**
     * Callback for when we click on an equipment slot.
     * @param callback Contains the slot type we are selecting.
     */

    public onSelect(callback: SelectCallback): void {
        this.selectCallback = callback;
    }
}
