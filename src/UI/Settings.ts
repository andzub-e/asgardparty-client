import { ASSETS } from "../Assets";
import { Button } from "../Button";
import { EVENTS } from "../Events";
import { Observer, ObserverText } from "../Observer";
import { TextStyles } from "../TextStyles";
import { Slider } from "./Slider";
import { Checkbox, ObserverCheckbox } from "../Checkbox";
import { LogicState } from "../logic_state";
import { AUDIO_MANAGER } from "../AudioManager";
import { get_localized_text } from "../linguist";

export class Settings implements Observer {
    app: PIXI.Application;
    container: PIXI.Container;
    landscape_container: PIXI.Container;

    mask?: PIXI.Sprite;
    bg?: PIXI.Sprite;
    close_button?: Button;
    slider_music?: Slider;
    slider_sound?: Slider;

    constructor(app: PIXI.Application) {
        this.app = app;

        this.container = new PIXI.Container();
        this.container.visible = false;
        this.container.interactive = true;

        this.landscape_container = new PIXI.Container();
        this.container.addChild(this.landscape_container);

        this.addEvents();
        this.createElements();
    }

    on_state_update = () => {
        // if (LogicState.sound_button_pressed) {
        //     LogicState.sound_button_pressed = false;
        //     if (LogicState.is_music_on) {
        //         this.slider_music?.set_value_index(10);
        //         this.slider_sound?.set_value_index(10);
        //     } else {
        //         this.slider_music?.set_value_index(0);
        //         this.slider_sound?.set_value_index(0);
        //     }
        // }
    };

    addEvents = () => {
        document.addEventListener("open_settings", () => {
            console.log("!!!MENU BUTTON!!!");
            this.container.visible = true;
        });

        document.addEventListener("close_settings", () => {
            console.log("!!!CLOSE MENU BUTTON!!!");
            console.log("vernii file");
            this.container.visible = false;
        });
    };

    createElements = () => {
        this.createBackground();
        this.createMask();
        this.createExitButton();
        this.addHeader();
        this.addDividers();
        this.createText();
        this.createSliders();
        this.createCheckboxes();
        // this.addHelpButton();

        document.addEventListener("toggle_music_signal", this.toggle_music);
        document.addEventListener("toggle_fx_signal", this.toggle_fx);
        document.addEventListener("music_slider", this.change_music_volume);
        document.addEventListener("sound_slider", this.change_sound_volume);
    };

    createMask = () => {
        this.mask = new PIXI.Sprite(
            PIXI.Loader.shared.resources["shadow"].texture
        );
        this.mask.zIndex = -1;
        this.mask.interactive = true;
        this.mask.on("pointerdown", () => {
            this.container.visible = false;
        });
        this.container.addChild(this.mask);
    };

    createBackground = () => {
        this.bg = new PIXI.Sprite(
            PIXI.Loader.shared.resources["bg_menu"].texture
        );
        this.bg.anchor.set(0.5);
        this.bg.position.set(720, 393.5);
        this.landscape_container.addChild(this.bg);
    };

    createExitButton = () => {
        this.close_button = new Button(ASSETS["Exit_button.png"], true);
        this.close_button.hover_texture = ASSETS["Exit_button_over.png"];

        this.close_button.sprite.position.set(921, 138);

        // this.close_button.sprite.hitArea = new PIXI.Circle(0, 0, 55.5); // ???

        this.close_button.event = EVENTS.close_settings;

        this.landscape_container.addChild(this.close_button.sprite);
    };

    addHeader = () => {
        const settings = new PIXI.Text(
            get_localized_text("help_settings"),
            TextStyles.menu_title
        );
        settings.anchor.set(0, 0.5);
        settings.position.set(495, 140);
        this.landscape_container.addChild(settings);
    };

    addDividers = () => {
        const divider = new PIXI.Sprite(ASSETS["Divider.png"]);
        divider.position.set(550, 200);

        const divider2 = new PIXI.Sprite(ASSETS["Divider.png"]);
        divider2.position.set(550, 575);

        this.landscape_container.addChild(divider, divider2);
    };

    createText = () => {
        const music = new PIXI.Text(
            get_localized_text("help_music"),
            TextStyles.settings_music
        );
        music.anchor.set(0, 0.5);
        music.position.set(480, 260);

        const music_mute = new ObserverText(
            get_localized_text("helpmenu_mute"),
            TextStyles.settings_mute,
            LogicState
        );
        music_mute.anchor.set(0, 0.5);
        music_mute.position.set(490, 345);
        music_mute.on_state_update = () => {
            if (LogicState.is_music_on) {
                music_mute.style = TextStyles.settings_mute;
            } else {
                music_mute.style = TextStyles.settings_mute_on;
            }
        };

        const sound = new PIXI.Text(
            get_localized_text("help_sound"),
            TextStyles.settings_sound
        );
        sound.anchor.set(0, 0.5);
        sound.position.set(467, 414);

        const sound_mute = new ObserverText(
            get_localized_text("helpmenu_mute"),
            TextStyles.settings_mute,
            LogicState
        );
        sound_mute.anchor.set(0, 0.5);
        sound_mute.position.set(490, 500);
        sound_mute.on_state_update = () => {
            if (LogicState.are_sound_fx_on) {
                sound_mute.style = TextStyles.settings_mute;
            } else {
                sound_mute.style = TextStyles.settings_mute_on;
            }
        };

        this.landscape_container.addChild(music, music_mute, sound, sound_mute);
    };

    createSliders = () => {
        this.slider_music = new Slider(
            ASSETS["Frame_setting.png"],
            ASSETS["Filling_setting.png"],
            ASSETS["Slider_button.png"],
            [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            "music_slider"
        );
        this.slider_music.head_hovered = ASSETS["Slider_button_over.png"];
        this.slider_music.head_pressed = ASSETS["Slider_button_pressed.png"];
        this.slider_music.head_disabled = ASSETS["Slider_button_disabled.png"];
        this.slider_music.bg.position.set(610, 303);
        this.landscape_container.addChild(this.slider_music.bg);
        this.slider_music.set_value_index(10);

        this.slider_sound = new Slider(
            ASSETS["Frame_setting.png"],
            ASSETS["Filling_setting.png"],
            ASSETS["Slider_button.png"],
            [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            "sound_slider"
        );
        this.slider_sound.head_hovered = ASSETS["Slider_button_over.png"];
        this.slider_sound.head_pressed = ASSETS["Slider_button_pressed.png"];
        this.slider_sound.head_disabled = ASSETS["Slider_button_disabled.png"];
        this.slider_sound.bg.position.set(610, 458);
        this.landscape_container.addChild(this.slider_sound.bg);
        this.slider_sound.set_value_index(10);
    };

    createCheckboxes = () => {
        const music_checkbox_bg: ObserverCheckbox = new Checkbox(
            ASSETS["On_button.png"],
            ASSETS["Off_button.png"],
            "toggle_music_signal",
            true
        );
        LogicState.add_observer(music_checkbox_bg);
        music_checkbox_bg.on_state_update = () => {
            if (music_checkbox_bg.toggled !== LogicState.is_music_on) {
                music_checkbox_bg.toggled = LogicState.is_music_on;
                music_checkbox_bg.update_graphics();
            }
        };
        music_checkbox_bg.sprite.position.set(486, 275);

        const sound_checkbox: ObserverCheckbox = new Checkbox(
            ASSETS["On_button.png"],
            ASSETS["Off_button.png"],
            "toggle_fx_signal",
            true
        );
        sound_checkbox.on_state_update = () => {
            if (sound_checkbox.toggled !== LogicState.are_sound_fx_on) {
                sound_checkbox.toggled = LogicState.are_sound_fx_on;
                sound_checkbox.update_graphics();
            }
        };
        LogicState.add_observer(sound_checkbox);

        sound_checkbox.sprite.position.set(486, 430);

        this.landscape_container.addChild(
            music_checkbox_bg.sprite,
            sound_checkbox.sprite
        );
    };

    change_music_volume = (e: Event) => {
        const event = e as CustomEvent<number>;

        if (event.detail === 0) {
            LogicState.is_music_on = false;
        } else {
            LogicState.is_music_on = true;
        }

        AUDIO_MANAGER.change_music_volume(event.detail);

        LogicState.music_volume = event.detail;
        LogicState.notify_all();
    };

    change_sound_volume = (e: Event) => {
        const event = e as CustomEvent<number>;

        if (event.detail === 0) {
            LogicState.are_sound_fx_on = false;
        } else {
            LogicState.are_sound_fx_on = true;
        }

        AUDIO_MANAGER.change_fx_volume(event.detail);

        LogicState.sound_fx_volume = event.detail;
        LogicState.notify_all();
    };

    toggle_music = () => {
        LogicState.is_music_on = !LogicState.is_music_on;
        LogicState.notify_all();

        if (LogicState.is_music_on) {
            AUDIO_MANAGER.change_music_volume(LogicState.music_volume);
            this.slider_music?.set_value_index(10);
        } else {
            AUDIO_MANAGER.change_music_volume(0);
            this.slider_music?.set_value_index(0);
        }
    };

    toggle_fx = () => {
        LogicState.are_sound_fx_on = !LogicState.are_sound_fx_on;
        LogicState.notify_all();

        if (LogicState.are_sound_fx_on) {
            AUDIO_MANAGER.change_fx_volume(LogicState.sound_fx_volume);
            this.slider_sound?.set_value_index(10);
        } else {
            AUDIO_MANAGER.change_fx_volume(0);
            this.slider_sound?.set_value_index(0);
        }
    };

    on_resize = () => {
        if (LogicState.is_mobile) {
            if (LogicState.is_landscape) {
                this.landscape_container.position.set(0);
                this.mask!.texture =
                    PIXI.Loader.shared.resources["shadow"].texture;
                this.mask!.anchor.set(0);
                this.mask!.position.set(0);

                this.landscape_container.scale.set(1);
            } else {
                this.landscape_container.position.set(-450, 280);
                this.mask!.texture =
                    PIXI.Loader.shared.resources["shadow_mobile"].texture;
                this.mask!.anchor.set(0, 0.5);
                this.mask!.position.y = 720;

                this.landscape_container.scale.set(1.2);
            }
        }
    };
}
