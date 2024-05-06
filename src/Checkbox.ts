import { Observer } from "./Observer";

export interface CheckboxEventDetail {
    toggled: boolean;
}

export class Checkbox {
    sprite: PIXI.Sprite;
    active: PIXI.Texture;
    inactive: PIXI.Texture;
    toggled: boolean;
    event: string;

    constructor(
        active: PIXI.Texture,
        inactive: PIXI.Texture,
        event: string,
        toggled = false
    ) {
        this.toggled = false;
        this.active = active;
        this.inactive = inactive;
        this.event = event;
        this.sprite = new PIXI.Sprite(inactive);
        this.sprite.interactive = true;
        this.sprite.cursor = "pointer";
        this.sprite.on("pointertap", this.toggle);

        if (toggled) {
            this.toggle();
        }
    }

    toggle = () => {
        if (this.toggled) {
            this.toggled = false;
            // this.sprite.texture = this.inactive;
        } else {
            this.toggled = true;
            // this.sprite.texture = this.active;
        }

        this.update_graphics();

        const event = new CustomEvent<CheckboxEventDetail>(this.event, {
            detail: {
                toggled: this.toggled,
            },
        });
        document.dispatchEvent(event);
    };

    update_graphics = () => {
        if (this.toggled) {
            this.sprite.texture = this.active;
        } else {
            this.sprite.texture = this.inactive;
        }
    };
}

export interface ObserverCheckbox extends Observer, Checkbox {}
