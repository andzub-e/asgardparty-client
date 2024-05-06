import anime from "animejs";
import { ECL } from "ecl";
import { ASSETS } from "../Assets";
import { Button } from "../Button";
import { Config } from "../Config";
import { EVENTS } from "../Events";
import { get_localized_text } from "../linguist";
import { LogicState } from "../logic_state";
import { ObserverText, Subject } from "../Observer";
import { TextStyles } from "../TextStyles";
import { Slider } from "./Slider";

type MoveAutospinDetail = "increase" | "decrease";

export class Autospin extends Subject {
    app: PIXI.Application;
    container: PIXI.Container;
    landscape_container: PIXI.Container;

    mask?: PIXI.Sprite;
    bg?: PIXI.Sprite;

    autospin_button?: Button;
    bet_button?: Button;
    sound_button?: Button;
    info_button?: Button;
    history_button?: Button;

    close_button?: Button;
    slider_single_win?: Slider;
    slider_cash_increases?: Slider;
    slider_cash_decreases?: Slider;

    slider_any_win?: Slider;
    slider_free_spins_won?: Slider;

    autospin_buttons_container = new PIXI.Container();
    move_autospin_animation: anime.AnimeInstance | null = null;

    nextButton?: Button;
    prevButton?: Button;
    autoplay_pos = 0;
    light_loss_limit?: PIXI.Sprite;
    light_loss_limit_anim?: anime.AnimeInstance;

    constructor(app: PIXI.Application) {
        super();

        this.app = app;
        this.container = new PIXI.Container();
        this.container.interactive = true;
        this.container.visible = false;

        this.landscape_container = new PIXI.Container();
        this.container.addChild(this.landscape_container);

        this.addEventListeners();
        this.createElements();
    }

    createElements = () => {
        this.createBackground();
        this.createTopButtons();
        this.addArrow();
        this.addHeader();
        this.addDividers();
        this.createText();
        this.createToggles();
        this.createSliders();
        this.createNumberOfSpin();

        this.createMask();
    };

    createMask = () => {
        this.mask = new PIXI.Sprite(
            PIXI.Loader.shared.resources["shadow"].texture
        );
        this.mask.interactive = true;
        this.mask.on("pointerdown", () => {
            this.container.visible = false;
        });
        this.mask.zIndex = -1;
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
        this.autospin_button = new Button(ASSETS["autospin_active.png"], true);
        this.autospin_button.hover_texture = ASSETS["autospin_active.png"];
        this.autospin_button.sprite.position.set(420, 80);
        // this.autospin_button.event = EVENTS.close_autospin_settings;
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

        this.sound_button = new Button(ASSETS["sound_inactive.png"], true);
        this.sound_button.hover_texture = ASSETS["sound_inactive.png"];
        this.sound_button.sprite.position.set(870, 80);
        this.sound_button.event = EVENTS.open_settings;
        this.landscape_container.addChild(this.sound_button.sprite);

        this.history_button = new Button(ASSETS["history_inactive.png"], true);
        this.history_button.hover_texture = ASSETS["history_inactive.png"];
        this.history_button.sprite.position.set(1020, 80);
        this.history_button.event = EVENTS.open_history;
        this.landscape_container.addChild(this.history_button.sprite);

        this.close_button = new Button(ASSETS["Exit_button.png"], true);
        this.close_button.hover_texture = ASSETS["Exit_button.png"];
        this.close_button.sprite.position.set(1077, 51);
        this.close_button.event = EVENTS.close_autospin_settings;
        this.landscape_container.addChild(this.close_button.sprite);
    };

    addArrow = () => {
        const arrow = new PIXI.Sprite(ASSETS["arrow.png"]);
        arrow.anchor.set(0.5);
        arrow.position.set(420, 126);
        this.landscape_container.addChild(arrow);
    };

    addHeader = () => {
        const autospin = new PIXI.Text(
            get_localized_text("helpmenu_autoplay_options"),
            TextStyles.menu_title
        );
        autospin.anchor.set(0.5);
        autospin.position.set(720, 167);
        this.landscape_container.addChild(autospin);
    };

    addDividers = () => {
        const divider = new PIXI.Sprite(ASSETS["Divider.png"]);
        divider.anchor.set(0.5);
        divider.position.set(720, 207);

        const divider2 = new PIXI.Sprite(ASSETS["Divider.png"]);
        divider2.anchor.set(0.5);
        divider2.position.set(720, 365);

        this.landscape_container.addChild(divider, divider2);
    };

    createText = () => {
        const autospin = new PIXI.Text(
            get_localized_text("helpmenu_stop_autoplay"),
            TextStyles.autospin_main_label
        );
        autospin.anchor.set(0.5);
        autospin.position.set(720, 385);

        const any = new PIXI.Text(
            get_localized_text("helpmenu_on_any_win"),
            TextStyles.autospin_toggle
        );
        any.anchor.set(0, 0.5);
        any.position.set(490, 440);

        const spins_won = new PIXI.Text(
            get_localized_text("helpmenu_if_free_spins"),
            TextStyles.autospin_toggle
        );
        spins_won.anchor.set(0, 0.5);
        spins_won.position.set(800, 440);

        const single = new PIXI.Text(
            get_localized_text("helpmenu_if_single_win"),
            TextStyles.autospin_more_label
        );
        single.anchor.set(0, 0);
        single.position.set(440, 490);

        const increase = new PIXI.Text(
            get_localized_text("helpmenu_if_balance_increases"),
            TextStyles.autospin_more_label
        );
        increase.anchor.set(0, 0);
        increase.position.set(440, 580);

        const decrease = new PIXI.Text(
            get_localized_text("helpmenu_if_balance_decreases"),
            TextStyles.autospin_more_label
        );
        decrease.anchor.set(0, 0);
        decrease.position.set(440, 670);

        this.landscape_container.addChild(
            autospin,
            single,
            increase,
            decrease,
            any,
            spins_won
        );
    };

    createToggles = () => {
        this.slider_any_win = new Slider(
            ASSETS["Bg_slider_s_autospin.png"],
            ASSETS["Filling_slider_s_autospin.png"],
            ASSETS["Slider_m_button.png"],
            Config.autospin_any_win_exceeds_values,
            "toggle_autospin_any_win_signal"
        );

        this.slider_any_win.head_hovered = ASSETS["Slider_m_button_over.png"];
        this.slider_any_win.head_pressed = ASSETS["Slider_m_button_over.png"];
        this.slider_any_win.head_disabled = ASSETS["Slider_m_button_over.png"];
        this.slider_any_win.bg.position.set(390, 440);
        this.landscape_container.addChild(this.slider_any_win.bg);

        this.slider_free_spins_won = new Slider(
            ASSETS["Bg_slider_s_autospin.png"],
            ASSETS["Filling_slider_s_autospin.png"],
            ASSETS["Slider_m_button.png"],
            Config.autospin_free_spins_won_exceeds_values,
            EVENTS.signals.toggle_stop_autospin_on_bonus_win
        );

        this.slider_free_spins_won.head_hovered =
            ASSETS["Slider_m_button_over.png"];
        this.slider_free_spins_won.head_pressed =
            ASSETS["Slider_m_button_over.png"];
        this.slider_free_spins_won.head_disabled =
            ASSETS["Slider_m_button_over.png"];
        this.slider_free_spins_won.bg.position.set(700, 440);
        this.landscape_container.addChild(this.slider_free_spins_won.bg);
    };

    createSliders = () => {
        this.slider_single_win = new Slider(
            ASSETS["Bg_slider_autospin.png"],
            ASSETS["Filling_slider_autospin.png"],
            ASSETS["Slider_m_button.png"],
            Config.autospin_single_win_exceeds_values,
            "slider_single_win"
        );

        this.slider_single_win.head_hovered =
            ASSETS["Slider_m_button_over.png"];
        this.slider_single_win.head_pressed =
            ASSETS["Slider_m_button_over.png"];
        this.slider_single_win.head_disabled =
            ASSETS["Slider_m_button_over.png"];
        this.slider_single_win.bg.position.set(390, 533);
        this.landscape_container.addChild(this.slider_single_win.bg);
        this.slider_single_win.set_value_index(0);

        const single_win_value = new ObserverText(
            ECL.fmt.money(0),
            TextStyles.autospin_number,
            LogicState
        );
        single_win_value.anchor.set(0, 0.5);
        single_win_value.position.set(790, 533);
        single_win_value.on_state_update = () => {
            if (LogicState.autospin_single_win_exceeds_flag) {
                // single_win_value.text = (
                //     LogicState.autospin_single_win_exceeds * LogicState.getBet()
                // ).toString();
                single_win_value.text = ECL.fmt.money(
                    LogicState.autospin_single_win_exceeds * LogicState.getBet()
                );
            } else {
                single_win_value.text = ECL.fmt.money(0);
            }
        };
        this.landscape_container.addChild(single_win_value);

        this.slider_cash_increases = new Slider(
            ASSETS["Bg_slider_autospin.png"],
            ASSETS["Filling_slider_autospin.png"],
            ASSETS["Slider_m_button.png"],
            Config.autospin_cash_increases_values,
            "slider_cash_increases"
        );
        this.slider_cash_increases.head_hovered =
            ASSETS["Slider_m_button_over.png"];
        this.slider_cash_increases.head_pressed =
            ASSETS["Slider_m_button_over.png"];
        this.slider_cash_increases.head_disabled =
            ASSETS["Slider_m_button_over.png"];
        this.slider_cash_increases.bg.position.set(390, 623);
        this.landscape_container.addChild(this.slider_cash_increases.bg);
        this.slider_cash_increases.set_value_index(0);

        const cash_increases_value = new ObserverText(
            ECL.fmt.money(0),
            TextStyles.autospin_number,
            LogicState
        );
        cash_increases_value.anchor.set(0, 0.5);
        cash_increases_value.position.set(790, 623);
        cash_increases_value.on_state_update = () => {
            if (LogicState.autospin_cash_increases_flag) {
                // cash_increases_value.text = (
                //     LogicState.autospin_cash_increases * LogicState.getBet()
                // ).toString();
                cash_increases_value.text = ECL.fmt.money(
                    LogicState.autospin_cash_increases * LogicState.getBet()
                );
            } else {
                cash_increases_value.text = ECL.fmt.money(0);
            }
        };
        this.landscape_container.addChild(cash_increases_value);

        this.slider_cash_decreases = new Slider(
            ASSETS["Bg_slider_autospin.png"],
            ASSETS["Filling_slider_autospin.png"],
            ASSETS["Slider_m_button.png"],
            Config.autospin_cash_decreases_values,
            "slider_cash_decreases"
        );
        this.slider_cash_decreases.head_hovered =
            ASSETS["Slider_m_button_over.png"];
        this.slider_cash_decreases.head_pressed =
            ASSETS["Slider_m_button_over.png"];
        this.slider_cash_decreases.head_disabled =
            ASSETS["Slider_m_button_over.png"];
        this.slider_cash_decreases.bg.position.set(390, 713);
        this.landscape_container.addChild(this.slider_cash_decreases.bg);
        this.slider_cash_decreases.set_value_index(0);

        const cash_decreases_value = new ObserverText(
            ECL.fmt.money(0),
            TextStyles.autospin_number,
            LogicState
        );
        cash_decreases_value.anchor.set(0, 0.5);
        cash_decreases_value.position.set(790, 713);
        cash_decreases_value.on_state_update = () => {
            if (LogicState.autospin_cash_decreases_flag) {
                // cash_decreases_value.text = (
                //     LogicState.autospin_cash_decreases * LogicState.getBet()
                // ).toString();
                cash_decreases_value.text = ECL.fmt.money(
                    LogicState.autospin_cash_decreases * LogicState.getBet()
                );
            } else {
                cash_decreases_value.text = ECL.fmt.money(0);
            }
        };
        this.landscape_container.addChild(cash_decreases_value);
    };

    createNumberOfSpin = () => {
        const label_1 = new PIXI.Text(
            get_localized_text("helpmenu_number_of_spins"),
            TextStyles.autospin_main_label
        );
        label_1.anchor.set(0.5);
        label_1.position.set(720, 245);
        this.landscape_container.addChild(label_1);

        const buttons_container = new PIXI.Container();
        buttons_container.position.set(450, 310);
        this.landscape_container.addChild(buttons_container);

        buttons_container.addChild(this.autospin_buttons_container);

        for (let i = 0; i < Config.available_autoplay_values.length; i++) {
            const amount = Config.available_autoplay_values[i];

            const btn = new Button(ASSETS["autoplay_btn_normal.png"], true);
            btn.hover_texture = ASSETS["autoplay_btn_over.png"];
            btn.pressed_texture = ASSETS["autoplay_btn_pressed.png"];
            this.autospin_buttons_container.addChild(btn.sprite);
            btn.sprite.x = i * 136;

            btn.event = new CustomEvent<number>("autospin_button_pressed", {
                detail: amount,
            });

            const value_text = new PIXI.Text(
                amount.toString(),
                TextStyles.autospin_numbers
            );
            value_text.anchor.set(0.5);
            btn.sprite.addChild(value_text);
        }
    };

    move_autospin_buttons = (e: Event) => {
        const event = e as CustomEvent<MoveAutospinDetail>;

        if (event.detail === "increase") {
            this.autoplay_pos++;
        } else {
            this.autoplay_pos--;
        }
        this.notify_all();

        if (this.move_autospin_animation) {
            this.move_autospin_animation.pause();
        }

        this.move_autospin_animation = anime({
            duration: 200,
            targets: this.autospin_buttons_container,
            x: this.autoplay_pos * -111,
            easing: "linear",
        });
    };

    addEventListeners = () => {
        document.addEventListener("close_autospin_settings", () => {
            this.container.visible = false;
            LogicState.isMainScreen = true;
        });

        document.addEventListener(
            "toggle_autospin_single_win_exceeds_signal",
            this.toggle_single_win_exceeds
        );
        document.addEventListener(
            "toggle_autospin_cash_increases_by_signal",
            this.toggle_cash_increases
        );
        document.addEventListener(
            "toggle_autospin_cash_decreases_by_signal",
            this.toggle_cash_decreases
        );
        document.addEventListener(
            "toggle_autospin_any_win_signal",
            this.toggle_any_win
        );
        document.addEventListener(
            EVENTS.signals.toggle_stop_autospin_on_bonus_win,
            this.toggle_bonus_win
        );
        document.addEventListener(
            "slider_single_win",
            this.change_single_win_value
        );
        document.addEventListener(
            "slider_cash_increases",
            this.change_cash_increase_value
        );
        document.addEventListener(
            "slider_cash_decreases",
            this.change_cash_decrease_value
        );

        document.addEventListener(
            "move_autospin_buttons_signal",
            this.move_autospin_buttons
        );

        document.addEventListener(
            "autospin_button_pressed",
            this.on_start_attempt
        );
    };

    on_start_attempt = (e: Event) => {
        const event = e as CustomEvent<number>;

        document.dispatchEvent(
            new CustomEvent<number>("start_autospin_event", {
                detail: event.detail,
            })
        );
    };

    toggle_single_win_exceeds = () => {
        LogicState.autospin_single_win_exceeds_flag =
            !LogicState.autospin_single_win_exceeds_flag;
        LogicState.notify_all();

        if (LogicState.autospin_single_win_exceeds_flag) {
            this.slider_single_win?.set_value_index(
                Config.autospin_single_win_exceeds_values.length - 1
            );
        } else {
            this.slider_single_win?.set_value_index(0);
        }
    };

    toggle_cash_increases = () => {
        LogicState.autospin_cash_increases_flag =
            !LogicState.autospin_cash_increases_flag;
        LogicState.notify_all();

        if (LogicState.autospin_cash_increases_flag) {
            this.slider_cash_increases?.set_value_index(
                Config.autospin_cash_increases_values.length - 1
            );
        } else {
            this.slider_cash_increases?.set_value_index(0);
        }
    };

    toggle_cash_decreases = () => {
        debugger;
        LogicState.autospin_cash_decreases_flag =
            !LogicState.autospin_cash_decreases_flag;
        LogicState.notify_all();
        console.log(
            "toggle_cash_decreases",
            LogicState.autospin_cash_decreases_flag
        );

        if (LogicState.autospin_cash_decreases_flag) {
            this.slider_cash_decreases?.set_value_index(
                Config.autospin_cash_decreases_values.length - 1
            );
        } else {
            this.slider_cash_decreases?.set_value_index(0);
        }
    };

    toggle_any_win = (e: Event) => {
        const event = e as CustomEvent<number>;
        if (event.detail === 0) {
            LogicState.autospin_any_win_flag = false;
        } else if (event.detail === 1) {
            LogicState.autospin_any_win_flag = true;
        }
    };

    toggle_bonus_win = (e: Event) => {
        console.log(LogicState.autospin_bonus_win_flag);
        const event = e as CustomEvent<number>;

        if (event.detail === 0) {
            LogicState.autospin_bonus_win_flag = false;
        } else if (event.detail === 1) {
            LogicState.autospin_bonus_win_flag = true;
        }
    };

    change_single_win_value = (e: Event) => {
        const event = e as CustomEvent<number>;

        if (event.detail === 0) {
            LogicState.autospin_single_win_exceeds_flag = false;
        } else {
            LogicState.autospin_single_win_exceeds_flag = true;
        }

        LogicState.autospin_single_win_exceeds = event.detail;
        LogicState.notify_all();
    };

    change_cash_increase_value = (e: Event) => {
        const event = e as CustomEvent<number>;

        console.log(event.detail);

        if (event.detail === 0) {
            LogicState.autospin_cash_increases_flag = false;
        } else {
            LogicState.autospin_cash_increases_flag = true;
        }

        LogicState.autospin_cash_increases = event.detail;
        LogicState.notify_all();
    };

    change_cash_decrease_value = (e: Event) => {
        const event = e as CustomEvent<number>;

        if (event.detail === 0) {
            LogicState.autospin_cash_decreases_flag = false;
        } else {
            LogicState.autospin_cash_decreases_flag = true;
        }

        LogicState.autospin_cash_decreases = event.detail;
        LogicState.notify_all();
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
}
