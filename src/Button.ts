import { Observer } from "./Observer";
import * as PIXI from "pixi.js";
import anime from "animejs";
import { AUDIO_MANAGER, SoundNames } from "./AudioManager";

export const enum ButtonStates {
    Active = "Active",
    Hovered = "Hovered",
    Pressed = "Pressed",
    Inactive = "Inactive",
    Hidden = "Hidden",
}

export class Button implements Observer {
    private current_anim?: anime.AnimeInstance;
    private scale = 1;
    sprite: PIXI.Sprite;
    state: ButtonStates = ButtonStates.Active;
    active_texture: PIXI.Texture;
    hover_texture?: PIXI.Texture;
    pressed_texture?: PIXI.Texture;
    inactive_texture?: PIXI.Texture;
    event?: Event | CustomEvent;
    is_closed_window: boolean;
    on_state_update?: () => void;

    sound_name: SoundNames = "click_sound";

    constructor(active_texture: PIXI.Texture, is_closed_window = false) {
        this.active_texture = active_texture;
        this.sprite = new PIXI.Sprite(active_texture);
        this.sprite.cursor = "pointer";
        this.sprite.interactive = true;
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.on("pointerover", this.hover_event);
        this.sprite.on("pointerout", this.unhover_event);
        this.sprite.on("pointerdown", this.press_event);
        this.sprite.on("pointerup", this.unpress_event);
        this.sprite.on("pointerupoutside", this.unpress_event);

        this.is_closed_window = is_closed_window;
    }

    callback = () => {};

    set_width = (width: number) => {
        this.sprite.width = width;
        this.sprite.height = width;
        this.scale = this.sprite.scale.x;
    };

    set_scale = (scale: number) => {
        this.sprite.scale.set(scale);
        this.scale = scale;
    };

    hover_event = () => {
        if (this.state === ButtonStates.Active) {
            this.state = ButtonStates.Hovered;
            if (this.hover_texture) {
                this.sprite.texture = this.hover_texture;
            }
        }
    };

    unhover_event = () => {
        if (this.state === ButtonStates.Hovered) {
            this.state = ButtonStates.Active;
            this.sprite.texture = this.active_texture;
        }
    };

    press_event = () => {
        if (
            this.state === ButtonStates.Active ||
            this.state === ButtonStates.Hovered ||
            this.state === ButtonStates.Pressed
        ) {
            this.state = ButtonStates.Pressed;

            let sound;

            if (this.sound_name) {
                sound = AUDIO_MANAGER[this.sound_name];
            }

            if (sound) {
                sound.play();
            }

            if (this.pressed_texture) {
                this.sprite.texture = this.pressed_texture;
            }
            this.current_anim?.pause();

            this.current_anim = anime({
                targets: this.sprite.scale,
                x: this.scale * 0.9,
                y: this.scale * 0.9,
                easing: "linear",
                duration: 75,
                complete: () => {
                    // if (!this.sprite.worldVisible) {
                    //     this.unpress_event();
                    // }
                    if (this.is_closed_window) {
                        this.unpress_event();
                    }
                },
            });

            if (this.event) {
                document.dispatchEvent(this.event);
            }

            if (this.callback) {
                this.callback();
            }
        }
    };

    unpress_event = () => {
        if (this.state === ButtonStates.Pressed) {
            this.state = ButtonStates.Active;
            this.current_anim?.pause();
            this.current_anim = anime({
                targets: this.sprite.scale,
                x: this.scale,
                y: this.scale,
                easing: "linear",
                duration: 75,
                complete: () => {
                    this.sprite.texture = this.active_texture;
                },
            });
        }
    };

    activate_button = () => {
        this.state = ButtonStates.Active;
        this.sprite.texture = this.active_texture;
        this.sprite.interactive = true;
        this.sprite.cursor = "pointer";
        this.sprite.scale.set(this.scale, this.scale);
    };

    inactivate_button = () => {
        this.current_anim?.pause();
        this.state = ButtonStates.Inactive;
        if (this.inactive_texture) {
            this.sprite.texture = this.inactive_texture;
        }
        this.sprite.interactive = false;
        this.sprite.cursor = "default";
    };

    hide_button = () => {
        this.sprite.visible = false;
    };

    show_button = () => {
        this.sprite.visible = true;
    };

    set_normal_texture = (texture: PIXI.Texture) => {
        this.active_texture = texture;
        this.sprite.texture = texture;
    };
}
