import { ASSETS } from "../Assets";
import { Button } from "../Button";
import { EVENTS } from "../Events";
import { Observer, ObserverText } from "../Observer";
import { TextStyles } from "../TextStyles";
import { Slider } from "./Slider";
import { Checkbox, CheckboxEventDetail, ObserverCheckbox } from "../Checkbox";
import { LogicState } from "../logic_state";
import { AUDIO_MANAGER } from "../AudioManager";
import { get_localized_text } from "../linguist";

export class Sound implements Observer {
    app: PIXI.Application;
    container: PIXI.Container;
    landscape_container: PIXI.Container;

    mask?: PIXI.Sprite;
    bg?: PIXI.Sprite;

    sound_button?: Button;
    bet_button?: Button;
    autospin_button?: Button;
    info_button?: Button;
    history_button?: Button;

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
        document.addEventListener("close_settings", () => {
            console.log("!!!CLOSE MENU BUTTON!!!");
            this.container.visible = false;
        });

        document.addEventListener("sound_button_clicked", () => {
            this.on_sound_button_clicked(false);
        });

        document.addEventListener("sound_off_button_clicked", () => {
            this.on_sound_button_clicked(true);
        });
    };

    createElements = () => {
        this.createBackground();
        this.createMask();
        this.createTopButtons();
        this.addArrow();
        this.addHeader();
        this.createText();
        this.createSliders();
        this.createCheckboxes();

        document.addEventListener("toggle_music_signal", this.toggle_music);
        document.addEventListener("toggle_fx_signal", this.toggle_fx);
        document.addEventListener("music_slider", this.change_music_volume);
        document.addEventListener("sound_slider", this.change_sound_volume);

        document.addEventListener(EVENTS.events.mute_toggled, (e: Event) => {
            const event = e as CustomEvent<CheckboxEventDetail>;
            this.on_sound_button_clicked(event.detail.toggled);
        });
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
        this.bg.interactive = true;
        this.bg.anchor.set(0.5);
        this.bg.position.set(720, 393.5);
        this.landscape_container.addChild(this.bg);
    };

    createTopButtons = () => {
        this.sound_button = new Button(ASSETS["sound_active.png"], true);
        this.sound_button.hover_texture = ASSETS["sound_active.png"];
        this.sound_button.sprite.position.set(870, 80);
        // this.sound_button.event = EVENTS.open_settings;
        this.landscape_container.addChild(this.sound_button.sprite);

        this.autospin_button = new Button(
            ASSETS["autospin_inactive.png"],
            true
        );
        this.autospin_button.hover_texture = ASSETS["autospin_inactive.png"];
        this.autospin_button.sprite.position.set(420, 80);
        this.autospin_button.event = EVENTS.autoplay_btn_clicked;
        this.landscape_container.addChild(this.autospin_button.sprite);

        this.bet_button = new Button(ASSETS["bet_inactive.png"], true);
        this.bet_button.hover_texture = ASSETS["bet_inactive.png"];
        this.bet_button.sprite.position.set(570, 80);
        this.bet_button.event = EVENTS.open_bet;
        this.landscape_container.addChild(this.bet_button.sprite);

        this.info_button = new Button(ASSETS["info_inactive.png"], true);
        this.info_button.hover_texture = ASSETS["info_inactive.png"];
        this.info_button.sprite.position.set(720, 80);
        this.info_button.event = EVENTS.help_event;
        this.landscape_container.addChild(this.info_button.sprite);

        this.history_button = new Button(ASSETS["history_inactive.png"], true);
        this.history_button.hover_texture = ASSETS["history_inactive.png"];
        this.history_button.sprite.position.set(1020, 80);
        this.history_button.event = EVENTS.open_history;
        this.landscape_container.addChild(this.history_button.sprite);

        this.close_button = new Button(ASSETS["Exit_button.png"], true);
        this.close_button.hover_texture = ASSETS["Exit_button.png"];
        this.close_button.sprite.position.set(1077, 51);
        this.close_button.event = EVENTS.close_settings;
        this.landscape_container.addChild(this.close_button.sprite);
    };

    addArrow = () => {
        const arrow = new PIXI.Sprite(ASSETS["arrow.png"]);
        arrow.anchor.set(0.5);
        arrow.position.set(870, 126);
        this.landscape_container.addChild(arrow);
    };

    addHeader = () => {
        const sound = new PIXI.Text(
            get_localized_text("helpmenu_sound_options"),
            TextStyles.menu_title
        );
        sound.anchor.set(0.5);
        sound.position.set(720, 167);
        this.landscape_container.addChild(sound);
    };

    createText = () => {
        const music = new PIXI.Text(
            get_localized_text("helpmenu_music_volume"),
            TextStyles.settings_music
        );
        music.anchor.set(0.5);
        music.position.set(720, 257);

        const music_mute = new ObserverText(
            get_localized_text("helpmenu_mute"),
            TextStyles.settings_mute,
            LogicState
        );
        music_mute.anchor.set(0, 0.5);
        music_mute.position.set(510, 570);

        const sound = new PIXI.Text(
            get_localized_text("helpmenu_sound_volume"),
            TextStyles.settings_music
        );
        sound.anchor.set(0.5);
        sound.position.set(720, 367);

        this.landscape_container.addChild(music, music_mute, sound);
    };

    createSliders = () => {
        this.slider_music = new Slider(
            ASSETS["Frame_setting.png"],
            ASSETS["Filling_setting.png"],
            ASSETS["Slider_sound_button.png"],
            [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            "music_slider"
        );
        this.slider_music.head_hovered = ASSETS["Slider_sound_button_over.png"];
        this.slider_music.head_pressed = ASSETS["Slider_sound_button_over.png"];
        this.slider_music.head_disabled =
            ASSETS["Slider_sound_button_over.png"];
        // this.slider_music.bg.anchor.set(0.5);
        this.slider_music.bg.position.set(435, 295);
        this.landscape_container.addChild(this.slider_music.bg);
        this.slider_music.set_value_index(10);

        this.slider_sound = new Slider(
            ASSETS["Frame_setting.png"],
            ASSETS["Filling_setting.png"],
            ASSETS["Slider_sound_button.png"],
            [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            "sound_slider"
        );
        this.slider_sound.head_hovered = ASSETS["Slider_sound_button_over.png"];
        this.slider_sound.head_pressed = ASSETS["Slider_sound_button_over.png"];
        this.slider_sound.head_disabled =
            ASSETS["Slider_sound_button_over.png"];
        // this.slider_sound.bg.anchor.set(0.5);
        this.slider_sound.bg.position.set(435, 405);
        this.landscape_container.addChild(this.slider_sound.bg);
        this.slider_sound.set_value_index(10);
    };

    createCheckboxes = () => {
        const music_checkbox_bg: ObserverCheckbox = new Checkbox(
            ASSETS["Slider_mute_button.png"],
            ASSETS["Slider_mute_button_over.png"],
            EVENTS.events.mute_toggled,
            true
        );
        LogicState.add_observer(music_checkbox_bg);
        music_checkbox_bg.on_state_update = () => {
            if (LogicState.is_music_on || LogicState.are_sound_fx_on) {
                music_checkbox_bg.toggled = true;
            } else {
                music_checkbox_bg.toggled = false;
            }

            music_checkbox_bg.update_graphics();
        };
        music_checkbox_bg.sprite.position.set(435, 540);

        this.landscape_container.addChild(music_checkbox_bg.sprite);
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
            this.slider_music!.set_value_index(10);
        } else {
            AUDIO_MANAGER.change_music_volume(0);
            this.slider_music!.set_value_index(0);
        }
    };

    toggle_fx = () => {
        LogicState.are_sound_fx_on = !LogicState.are_sound_fx_on;
        LogicState.notify_all();

        if (LogicState.are_sound_fx_on) {
            AUDIO_MANAGER.change_fx_volume(LogicState.sound_fx_volume);
            this.slider_sound!.set_value_index(10);
        } else {
            AUDIO_MANAGER.change_fx_volume(0);
            this.slider_sound!.set_value_index(0);
        }
    };

    on_resize = () => {
        if (LogicState.is_mobile) {
            const appWidth = this.app.screen.width;
            const appHeight = this.app.screen.height;

            this.mask!.texture = PIXI.Loader.shared.resources["shadow"].texture;
            this.mask!.anchor.set(0.5);
            this.mask!.width = appWidth;
            this.mask!.height = appHeight;
            this.mask!.position.set(appWidth / 2, appHeight / 2);

            if (LogicState.is_landscape) {
                this.landscape_container.position.set(0);
            } else {
                this.landscape_container.position.set(
                    -315,
                    appHeight / 2 - 380
                );
            }
        }
    };

    on_sound_button_clicked = (state: boolean) => {
        if (LogicState.is_music_on === LogicState.are_sound_fx_on) {
            document.dispatchEvent(new Event("toggle_music_signal"));
            document.dispatchEvent(new Event("toggle_fx_signal"));
        } else if (LogicState.is_music_on !== state) {
            document.dispatchEvent(new Event("toggle_music_signal"));
        } else if (LogicState.are_sound_fx_on !== state) {
            document.dispatchEvent(new Event("toggle_fx_signal"));
        }

        LogicState.are_sound_fx_on = state;
        LogicState.is_music_on = state;
        // Howler.mute(!state);

        LogicState.notify_all();
    };
}
