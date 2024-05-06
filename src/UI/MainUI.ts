import { Button, ButtonStates } from "../Button";
import { EVENTS, waitForEvent } from "../Events";
import { LogicState } from "../logic_state";
import { TextStyles } from "../TextStyles";
import { Help } from "./Help";
import { ASSETS } from "../Assets";
import {
    ObserverBitmapText,
    ObserverContainer,
    ObserverText,
} from "../Observer";
import { Sprite } from "pixi.js";
import { Autospin } from "./Autospin";
import { Sound } from "./Sound";
import { History } from "./History";
import { Bet } from "./Bet";
import { SessionConfig } from "../SessionConfig";
import { ECL } from "ecl";
import { rescale_to_width } from "../Util";
import { get_localized_text } from "../linguist";
import { Config } from "../Config";

export class MainUI {
    app: PIXI.Application;
    container: PIXI.Container;

    // settings: Settings;
    sounds: Sound;
    help: Help;
    autospin_panel: Autospin;
    history: History;
    total_bet: Bet;

    spin?: Button;
    empty_spin?: Button;
    slam_stop?: Button;
    turbo?: Button;
    turbo_stop?: Button;
    autoplay?: Button;
    autoplay_stop?: Button;
    paytable?: Button;
    autospin_counter?: Button;
    bet?: Button;
    menu?: Button;

    meter_bar?: PIXI.Sprite;

    game_message?: PIXI.Text;

    bet_panel?: PIXI.Container;
    bet_panel_plus?: Button;
    bet_panel_minus?: Button;
    bet_panel_text?: ObserverText;

    autoplay_container?: PIXI.Container;

    autoplay_spins_left_text?: ObserverText;

    menu_container?: PIXI.Container;

    balance_label_text?: PIXI.Text;
    bet_label_text?: PIXI.Text;

    win_label_text?: ObserverText;
    win_text?: ObserverText;
    win_panel!: ObserverContainer;

    balance_text?: ObserverText;
    bet_text?: ObserverText;

    black_panel?: PIXI.Container;
    sound?: Button;
    sound_off?: Button;
    options_button?: Button;
    main_panel?: Sprite;

    bg_black_panel?: PIXI.Sprite;
    help_button?: Button;
    fullscreen?: Button;
    exit?: Button;
    bet_text_size = 160;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.build_static_background();

        this.build_empty_spin_button();
        this.build_spin_button();
        this.build_autospin_counter();
        this.build_turbo_button();
        this.build_autoplay_button();

        this.build_options_button();

        this.build_black_panel();

        this.build_bet_panel();

        this.build_middle_panel();

        this.add_event_listeners();

        this.sounds = new Sound(app);
        this.autospin_panel = new Autospin(app);
        this.help = new Help(app);
        this.history = new History(app);
        this.total_bet = new Bet(app);

        this.container.addChild(
            this.help.container,
            this.sounds.container,
            this.autospin_panel.container,
            this.history.container,
            this.total_bet.container
        );
    }

    build_static_background = () => {
        this.main_panel = new PIXI.Sprite(ASSETS["UI_plate.png"]);
        this.main_panel.anchor.set(0.5, 1);
        this.main_panel.position.set(this.app.screen.width / 2, 810);
        this.container.addChild(this.main_panel);
    };

    build_empty_spin_button = () => {
        this.empty_spin = new Button(ASSETS["Empty_button.png"]);
        this.empty_spin.hover_texture = ASSETS["Empty_button_over.png"];
        this.empty_spin.pressed_texture = ASSETS["Empty_button_pressed.png"];
        this.empty_spin.inactive_texture = ASSETS["Empty_button_disabled.png"];

        this.container.addChild(this.empty_spin.sprite);

        this.empty_spin.sound_name = "spin_sound";

        this.empty_spin.event = EVENTS.slam_stop_event;
        LogicState.add_observer(this.empty_spin);
        this.empty_spin.on_state_update = () => {
            if (!LogicState.is_bonus_mode) {
                this.empty_spin!.hide_button();
                return;
            }

            if (LogicState.first_free_spin) {
                this.empty_spin!.hide_button();
                return;
            }

            this.empty_spin!.show_button();

            if (LogicState.sm_state === "idle") {
                if (this.empty_spin!.state === ButtonStates.Inactive) {
                    this.empty_spin!.activate_button();
                }
            }
        };
        this.empty_spin.sprite.position.set(720, 751.5);

        const fs_value = new ObserverBitmapText(
            "25",
            {
                fontName: "big_win",
                fontSize: 50,
            },
            LogicState
        );
        fs_value.position.set();
        fs_value.anchor = new PIXI.Point(0.5, 0.5);
        fs_value.y = -6;
        fs_value.on_state_update = () => {
            if (LogicState.sm_state === "spin_end") {
                fs_value.text = LogicState.free_spins_left.toString();
            }
        };
        this.empty_spin.sprite.addChild(fs_value);
    };

    build_spin_button = () => {
        console.log("!!! Build Spin Button");

        this.spin = new Button(ASSETS["Spin_button.png"]);
        this.spin.hover_texture = ASSETS["Spin_button_over.png"];
        this.spin.pressed_texture = ASSETS["Spin_button_pressed.png"];
        this.spin.inactive_texture = ASSETS["Spin_button_disabled.png"];

        this.container.addChild(this.spin.sprite);

        this.spin.sound_name = "spin_sound";

        this.spin.event = EVENTS.spin_event;

        LogicState.add_observer(this.spin);
        this.spin.on_state_update = () => {
            this.spin!.sprite.visible = !LogicState.is_autoplay;

            if (
                LogicState.sm_state === "spin_start" ||
                LogicState.sm_state === "spinning" ||
                LogicState.sm_state === "spin_end"
            ) {
                this.spin!.inactivate_button();
                this.spin!.hide_button();
            }

            if (LogicState.sm_state === "idle") {
                if (this.spin!.state === ButtonStates.Inactive) {
                    this.spin!.activate_button();
                    this.spin!.show_button();
                }
            }

            if (LogicState.first_free_spin && LogicState.is_bonus_mode) {
                this.spin!.activate_button();
                this.spin!.show_button();
            }
        };
        this.spin.sprite.position.set(720, 751.5);

        this.slam_stop = new Button(ASSETS["Pause_button.png"]);
        this.slam_stop.hover_texture = ASSETS["Pause_button_over.png"];
        this.slam_stop.pressed_texture = ASSETS["Pause_button_pressed.png"];
        this.slam_stop.inactive_texture = ASSETS["Pause_button_disabled.png"];
        this.slam_stop.sprite.position.set(720, 751.5);

        this.container.addChild(this.slam_stop.sprite);
        this.slam_stop!.event = EVENTS.slam_stop_event;

        LogicState.add_observer(this.slam_stop);
        this.slam_stop.on_state_update = () => {
            if (LogicState.is_bonus_mode) {
                this.slam_stop!.hide_button();
                return;
            }

            if (!LogicState.is_autoplay) {
                if (LogicState.sm_state !== "idle") {
                    this.slam_stop?.activate_button();
                    this.slam_stop?.show_button();

                    if (
                        !LogicState.slam_stop &&
                        LogicState.sm_state === "spinning"
                    ) {
                        this.slam_stop!.event = EVENTS.slam_stop_event;
                    }

                    if (
                        LogicState.slam_stop ||
                        LogicState.sm_state !== "spinning"
                    ) {
                        if (!LogicState.skip_button_pressed && LogicState.win) {
                            this.slam_stop?.activate_button();
                            this.slam_stop!.event = EVENTS.skip_button_pressed;
                        } else {
                            this.slam_stop?.inactivate_button();
                        }
                    }
                } else {
                    this.slam_stop?.hide_button();
                }
            } else {
                this.slam_stop?.hide_button();
            }

            if (LogicState.first_free_spin && LogicState.is_bonus_mode) {
                this.slam_stop?.hide_button();

                return;
            }

            if (!SessionConfig.enableSlamStop) {
                this.slam_stop?.inactivate_button();
            }
        };
    };

    build_autospin_counter = () => {
        this.autospin_counter = new Button(ASSETS["Empty_button.png"]);
        this.autospin_counter.hover_texture = ASSETS["Empty_button_over.png"];
        this.autospin_counter.pressed_texture =
            ASSETS["Empty_button_pressed.png"];
        this.autospin_counter.inactive_texture =
            ASSETS["Empty_button_disabled.png"];
        this.autospin_counter.sprite.position.set(720, 751.5);
        this.container.addChild(this.autospin_counter.sprite);

        this.autoplay_spins_left_text = new PIXI.Text(
            "",
            TextStyles.autospin_numbers
        );
        this.autoplay_spins_left_text.anchor.set(0.5);
        this.autospin_counter.sprite.addChild(this.autoplay_spins_left_text);

        this.autospin_counter.event = EVENTS.slam_stop_event;
        this.autospin_counter.sprite.visible = false;
        LogicState.add_observer(this.autospin_counter);
        this.autospin_counter.on_state_update = () => {
            this.autoplay_spins_left_text!.text =
                LogicState.autoplay_spins_remaining.toString();

            if (LogicState.is_autoplay && LogicState.game_state === "base") {
                this.autospin_counter?.activate_button();
                this.autospin_counter?.show_button();
            } else {
                this.autospin_counter?.inactivate_button();
                this.autospin_counter?.hide_button();
            }

            if (!LogicState.slam_stop && LogicState.sm_state === "spinning") {
                this.autospin_counter!.event = EVENTS.slam_stop_event;
            }

            if (LogicState.slam_stop || LogicState.sm_state !== "spinning") {
                if (!LogicState.skip_button_pressed && LogicState.win) {
                    this.autospin_counter?.activate_button();
                    this.autospin_counter!.event = EVENTS.skip_button_pressed;
                } else {
                    this.autospin_counter?.inactivate_button();
                }
            }
        };
    };

    build_turbo_button = () => {
        this.turbo = new Button(ASSETS["Turbo_button.png"]);
        this.turbo.hover_texture = ASSETS["Turbo_button_over.png"];
        this.turbo.pressed_texture = ASSETS["Turbo_button_pressed.png"];
        this.turbo.inactive_texture = ASSETS["Turbo_button_disabled.png"];
        this.turbo.sprite.position.set(573, 751.5);
        this.container.addChild(this.turbo.sprite);
        this.turbo.event = EVENTS.toggle_turbo;
        LogicState.add_observer(this.turbo);
        this.turbo.on_state_update = () => {
            if (LogicState.spin_mode === "turbo") {
                this.turbo!.hide_button();
            } else {
                this.turbo!.show_button();
            }
        };

        this.turbo_stop = new Button(ASSETS["Turbo_on_button.png"]);
        this.turbo_stop.hover_texture = ASSETS["Turbo_on_button_over.png"];
        this.turbo_stop.pressed_texture = ASSETS["Turbo_on_button_pressed.png"];
        this.turbo_stop.inactive_texture =
            ASSETS["Turbo_on_button_disabled.png"];
        this.turbo_stop.sprite.position.set(573, 751.5);
        this.container.addChild(this.turbo_stop.sprite);
        this.turbo_stop.event = EVENTS.toggle_turbo;
        LogicState.add_observer(this.turbo_stop);
        this.turbo_stop.on_state_update = () => {
            if (LogicState.spin_mode === "base") {
                this.turbo_stop!.hide_button();
            } else {
                this.turbo_stop!.show_button();
            }
        };
    };

    build_autoplay_button = () => {
        this.autoplay = new Button(ASSETS["Autoplay_button.png"]);
        this.autoplay.hover_texture = ASSETS["Autoplay_button_over.png"];
        this.autoplay.pressed_texture = ASSETS["Autoplay_button_pressed.png"];
        this.autoplay.inactive_texture = ASSETS["Autoplay_button_disabled.png"];
        this.autoplay.sprite.position.set(864, 751.5);
        this.container.addChild(this.autoplay.sprite);
        this.autoplay.event = EVENTS.autoplay_btn_clicked;
        LogicState.add_observer(this.autoplay);
        this.autoplay.on_state_update = () => {
            if (!SessionConfig.enableAutoSpin) {
                this.autoplay?.hide_button();

                return;
            }

            if (LogicState.should_be_autoplay) {
                this.autoplay?.hide_button();
            } else {
                this.autoplay!.activate_button();
                this.autoplay!.show_button();
            }
            if (LogicState.sm_state !== "idle") {
                this.autoplay?.inactivate_button();
            }
        };

        this.autoplay_stop = new Button(ASSETS["Stop_button.png"]);
        this.autoplay_stop.hover_texture = ASSETS["Stop_button_over.png"];
        this.autoplay_stop.pressed_texture = ASSETS["Stop_button_pressed.png"];
        this.autoplay_stop.inactive_texture =
            ASSETS["Stop_button_disabled.png"];
        this.autoplay_stop.sprite.position.set(864, 751.5);
        this.container.addChild(this.autoplay_stop.sprite);
        this.autoplay_stop.event = EVENTS.stop_event;

        LogicState.add_observer(this.autoplay_stop);

        this.autoplay_stop.on_state_update = () => {
            if (LogicState.should_be_autoplay) {
                this.autoplay_stop!.activate_button();
                this.autoplay_stop!.show_button();
            } else {
                this.autoplay_stop?.hide_button();
            }
        };
    };

    build_bet_button = () => {
        this.bet = new Button(ASSETS["bet_1.png"]);
        this.bet.pressed_texture = ASSETS["bet_2.png"];
        this.bet.inactive_texture = ASSETS["bet_3.png"];
        this.container.addChild(this.bet.sprite);
        this.bet.event = EVENTS.open_mobile_bet_panel;
        LogicState.add_observer(this.bet);
        this.bet.on_state_update = () => {
            switch (LogicState.sm_state) {
                case "spin_start" || "spinning" || "spin_end": {
                    this.spin!.inactivate_button();
                    break;
                }
                case "idle": {
                    if (this.spin?.state === ButtonStates.Inactive) {
                        this.spin.activate_button();
                    }
                }
            }
        };
    };

    build_middle_panel = () => {
        // LEFT
        this.win_panel = new ObserverContainer(LogicState);
        this.container.addChild(this.win_panel);
        LogicState.add_observer(this.win_panel);
        this.win_panel.on_state_update = () => {};
        this.win_panel.position.set(
            160,
            this.app.screen.height - this.main_panel!.height / 2
        );
        this.win_label_text = new ObserverText(
            get_localized_text("mainui_win"),
            TextStyles.win_label,
            LogicState
        );

        this.win_label_text.anchor.set(1, 0.5);
        this.win_panel.addChild(this.win_label_text);

        // RIGHT
        this.win_text = new ObserverText(
            "--",
            TextStyles.win_value,
            LogicState
        );
        this.win_text.anchor.set(0, 0.5);
        this.win_panel.addChild(this.win_text);

        const toggle = () => {
            this.win_label_text!.text = LogicState.is_bonus_mode
                ? get_localized_text("bonus_total_win")
                : get_localized_text("mainui_win");

            if (LogicState.is_mobile && !LogicState.is_landscape) {
                this.win_panel.scale.set(1);
            } else {
                rescale_to_width(this.win_panel, 465);
                this.win_panel.x =
                    this.win_label_text!.width * this.win_panel.scale.x + 40;
            }
        };

        LogicState.add_observer({
            on_state_update: toggle.bind(this),
        });

        document.addEventListener("win_changed", () => {
            this.win_text!.text =
                LogicState.win === 0 ? "--" : ECL.fmt.money(LogicState.win);
            LogicState.notify_all();
        });
        document.addEventListener("spin_event", () => {
            if (LogicState.game_state === "base") this.win_text!.text = "--";
        });
    };

    build_options_button = () => {
        this.options_button = new Button(ASSETS["Menu_button.png"]);
        this.options_button.hover_texture = ASSETS["Menu_button_over.png"];
        this.options_button.pressed_texture = ASSETS["Menu_button_pressed.png"];
        this.options_button.inactive_texture =
            ASSETS["Menu_button_disabled.png"];

        this.options_button.sprite.position.set(62, 92);
        this.container.addChild(this.options_button.sprite);

        this.options_button.event = EVENTS.help_event;
        LogicState.add_observer(this.options_button);
        this.options_button.on_state_update = () => {
            switch (LogicState.sm_state) {
                case "spin_start": {
                    this.options_button!.inactivate_button();
                    break;
                }
                case "spinning": {
                    this.options_button!.inactivate_button();
                    break;
                }
                case "spin_end": {
                    this.options_button!.inactivate_button();
                    break;
                }
                case "idle": {
                    if (this.options_button?.state === ButtonStates.Inactive) {
                        this.options_button!.activate_button();
                    }
                }
            }
        };
    };

    build_black_panel = () => {
        const position_y = 12;

        this.black_panel = new PIXI.Container();
        this.container.addChild(this.black_panel);

        this.bg_black_panel = new PIXI.Sprite(ASSETS["Top_Plate.png"]);
        this.black_panel?.addChild(this.bg_black_panel);

        this.sound = new Button(ASSETS["sound_ap.png"]);
        this.sound.sprite.position.set(35.5, position_y);
        this.black_panel.addChild(this.sound.sprite);
        this.sound.event = EVENTS.sound_button_clicked;
        LogicState.add_observer(this.sound);
        this.sound.on_state_update = () => {
            if (LogicState.is_music_on || LogicState.are_sound_fx_on) {
                this.sound!.show_button();
            } else {
                this.sound!.hide_button();
            }
        };

        this.sound_off = new Button(ASSETS["mute_ap.png"]);
        this.sound_off.sprite.position.set(35.5, position_y);
        this.sound_off.sprite.visible = false;
        this.black_panel.addChild(this.sound_off.sprite);
        this.sound_off.event = EVENTS.sound_off_button_clicked;
        LogicState.add_observer(this.sound_off);
        this.sound_off.on_state_update = () => {
            if (LogicState.is_music_on || LogicState.are_sound_fx_on) {
                this.sound_off!.hide_button();
            } else {
                this.sound_off!.show_button();
            }
        };

        this.help_button = new Button(ASSETS["help_ap.png"]);
        this.help_button.sprite.position.set(75.0, position_y);
        this.black_panel.addChild(this.help_button.sprite);
        this.help_button.event = EVENTS.help_event;

        LogicState.add_observer(this.help_button);
        this.help_button.on_state_update = () => {
            switch (LogicState.sm_state) {
                case "spin_start" || "spinning" || "spin_end": {
                    this.help_button!.inactivate_button();
                    break;
                }
                case "idle": {
                    if (this.help_button?.state === ButtonStates.Inactive) {
                        this.help_button!.activate_button();
                    }
                }
            }
        };

        if (!LogicState.is_mobile) {
            this.fullscreen = new Button(ASSETS["full_screen_ap.png"]);
            this.fullscreen.sprite.position.set(115, position_y);
            this.black_panel.addChild(this.fullscreen.sprite);
            this.fullscreen.event = EVENTS.full_screen;
            LogicState.add_observer(this.fullscreen);
            this.fullscreen.on_state_update = () => {
                if (LogicState.is_fullscreen) {
                    this.fullscreen!.set_normal_texture(ASSETS["turn_ap.png"]);
                } else {
                    this.fullscreen!.set_normal_texture(
                        ASSETS["full_screen_ap.png"]
                    );
                }
            };
        }

        this.balance_text = new ObserverText(
            `${get_localized_text("mainui_balance")} ${ECL.fmt.money(
                LogicState.balance
            )}`,
            TextStyles.balance_label,
            LogicState
        );
        this.balance_text.position.set(1440 / 2, position_y);
        this.balance_text.anchor.set(0.5, 0.5);
        this.balance_text.on_state_update = () => {
            if (
                LogicState.sm_state === "spin_start" &&
                !ECL.PFR.is_free_spinning &&
                LogicState.game_state != "bonus"
            ) {
                const balance =
                    LogicState.balance < LogicState.getBet()
                        ? LogicState.balance
                        : LogicState.balance - LogicState.getBet();

                this.balance_text!.text = `${get_localized_text(
                    "mainui_balance"
                )} ${ECL.fmt.money(balance)}`;
            }

            waitForEvent("spin_animation_end").then(() => {
                if (
                    LogicState.sm_state === "spin_end" &&
                    !LogicState.is_bonus_mode &&
                    !(
                        LogicState.win / LogicState.getBet() >=
                        Config.big_win_ratios.big_win
                    )
                ) {
                    this.balance_text!.text = `${get_localized_text(
                        "mainui_balance"
                    )} ${ECL.fmt.money(LogicState.box.balance)}`;
                }
                if (
                    LogicState.is_autoplay &&
                    LogicState.getBet() > LogicState.balance
                ) {
                    LogicState.is_autoplay = false;
                    LogicState.should_be_autoplay = false;
                    LogicState.autoplay_spins_remaining = 0;
                    LogicState.is_infinite_autoplay = false;
                    LogicState.notify_all();
                }
            });
            waitForEvent("big_win_ended").then(() => {
                if (
                    LogicState.win / LogicState.getBet() >=
                    Config.big_win_ratios.big_win
                ) {
                    this.balance_text!.text = `${get_localized_text(
                        "mainui_balance"
                    )} ${ECL.fmt.money(LogicState.box.balance)}`;
                }
            });
            waitForEvent("restore_game").then(() => {
                this.balance_text!.text = `${get_localized_text(
                    "mainui_balance"
                )} ${ECL.fmt.money(LogicState.balance)}`;
            });
        };
        this.black_panel.addChild(this.balance_text);

        this.exit = new Button(ASSETS["close_ap.png"]);
        this.exit.sprite.position.set(1425, position_y);
        this.black_panel.addChild(this.exit.sprite);
        this.exit.event = EVENTS.empty_event;
        LogicState.add_observer(this.exit);
        this.exit.on_state_update = () => {};
        this.exit.callback = () => {
            const url = ECL.urlD.getLobbyURL();
            if (url) {
                window.location.href = url;
            }
        };
    };

    build_bet_panel = () => {
        this.bet_panel = new PIXI.Container();
        this.container.addChild(this.bet_panel);

        this.bet_panel_plus = new Button(ASSETS["Plus.png"]);
        this.bet_panel_plus.hover_texture = ASSETS["Plus_over.png"];
        this.bet_panel_plus.pressed_texture = ASSETS["Plus_pressed.png"];
        this.bet_panel_plus.inactive_texture = ASSETS["Plus_disabled.png"];
        this.bet_panel.addChild(this.bet_panel_plus.sprite);
        this.bet_panel_plus.sprite.hitArea = new PIXI.Circle(0, 0, 40);
        this.bet_panel_plus.event = EVENTS.increase_bet_event;
        LogicState.add_observer(this.bet_panel_plus);
        this.bet_panel_plus.on_state_update = () => {
            if (ECL.PFR.is_free_spinning) {
                if (this.bet_panel_plus!.state === ButtonStates.Active) {
                    this.bet_panel_plus!.inactivate_button();
                }
            } else {
                switch (LogicState.sm_state) {
                    case "idle": {
                        if (
                            this.bet_panel_plus?.state ===
                                ButtonStates.Inactive &&
                            LogicState.server_state!.wager_levels.length - 1
                        ) {
                            this.bet_panel_plus.activate_button();
                        } else if (
                            this.bet_panel_plus?.state !==
                                ButtonStates.Inactive &&
                            LogicState.level_index ===
                                LogicState.server_state!.wager_levels.length - 1
                        ) {
                            this.bet_panel_plus!.inactivate_button();
                        }
                        break;
                    }
                    default: {
                        if (
                            this.bet_panel_plus?.state === ButtonStates.Active
                        ) {
                            this.bet_panel_plus.inactivate_button();
                        }
                    }
                }
            }
        };

        this.bet_panel_minus = new Button(ASSETS["Minus.png"]);
        this.bet_panel_minus.hover_texture = ASSETS["Minus_over.png"];
        this.bet_panel_minus.pressed_texture = ASSETS["Minus_pressed.png"];
        this.bet_panel_minus.inactive_texture = ASSETS["Minus_disabled.png"];
        this.bet_panel.addChild(this.bet_panel_minus.sprite);
        this.bet_panel_minus.event = EVENTS.decrease_bet_event;
        LogicState.add_observer(this.bet_panel_minus);
        this.bet_panel_minus.on_state_update = () => {
            if (ECL.PFR.is_free_spinning) {
                if (this.bet_panel_minus!.state === ButtonStates.Active) {
                    this.bet_panel_minus!.inactivate_button();
                }
            } else {
                switch (LogicState.sm_state) {
                    case "idle": {
                        if (
                            this.bet_panel_minus?.state ===
                                ButtonStates.Inactive &&
                            LogicState.level_index > 0
                        ) {
                            this.bet_panel_minus.activate_button();
                        } else if (
                            this.bet_panel_minus?.state !==
                                ButtonStates.Inactive &&
                            LogicState.level_index === 0
                        ) {
                            this.bet_panel_minus!.inactivate_button();
                        }
                        break;
                    }
                    default: {
                        if (
                            this.bet_panel_minus?.state === ButtonStates.Active
                        ) {
                            this.bet_panel_minus.inactivate_button();
                        }
                    }
                }
            }
        };

        this.bet_panel_text = new ObserverText(
            (LogicState.level_index + 1).toString(),
            TextStyles.coin_value_value,
            LogicState
        );
        this.bet_panel_text.anchor.set(0.5, 0.5);
        this.bet_panel_text.on_state_update = () => {
            const label = get_localized_text("mainui_bet");
            if (ECL.PFR.is_free_spinning) {
                this.bet_panel_text!.text = `${label} FREE`;
            } else {
                this.bet_panel_text!.text = `${label} ${ECL.fmt.money(
                    LogicState.getBet()
                )}`;
            }

            if (LogicState.is_mobile) {
                if (LogicState.is_landscape)
                    rescale_to_width(this.bet_panel_text!, 215);
                else rescale_to_width(this.bet_panel_text!, 280);
            } else rescale_to_width(this.bet_panel_text!, 215);
        };
        this.bet_panel.addChild(this.bet_panel_text);

        this.bet_panel!.position.set(
            this.app.screen.width - 470,
            this.app.screen.height - this.main_panel!.height / 2
        );

        this.bet_panel_plus!.sprite.position.set(355, 0);
        this.bet_panel_minus!.sprite.position.set(70, 0);
        this.bet_panel_text!.position.set(214, 1);
    };

    increase_level = () => {
        LogicState.level_index++;
        LogicState.notify_all();
    };

    decrease_level = () => {
        LogicState.level_index--;
        LogicState.notify_all();
    };

    menu_btn_clicked = () => {
        this.menu_container!.visible = !this.menu_container!.visible;
    };

    hide_pop_up = () => {
        LogicState.reels_target_symbols.forEach((reel) =>
            reel.target_symbols.forEach((symbol) => symbol.pop_up_hide())
        );
        LogicState.top_reels_target_symbols!.target_symbols.forEach((symbol) =>
            symbol.pop_up_hide()
        );
    };

    add_event_listeners = () => {
        document.addEventListener("help_btn_clicked", () => {
            this.hide_pop_up();

            LogicState.isMainScreen = false;
            this.help.container.visible = true;
            this.total_bet.container.visible = false;
            this.sounds.container.visible = false;
            this.autospin_panel.container.visible = false;
            this.sounds.container.visible = false;
            this.history.container.visible = false;
            this.help.update_payouts();
        });
        document.addEventListener("menu_btn_clicked", this.menu_btn_clicked);

        document.addEventListener("toggle_turbo", this.toggle_turbo);
        document.addEventListener("empty_event", this.closeGame);

        document.addEventListener("slam_stop_event", this.activate_slam_stop);

        document.addEventListener("full_screen", this.toggleFullScreen);

        document.addEventListener("open_settings", () => {
            this.sounds.container.visible = true;
            this.total_bet.container.visible = false;
            this.autospin_panel.container.visible = false;
            this.help.container.visible = false;
            this.history.container.visible = false;
        });

        document.addEventListener("autoplay_btn_clicked", () => {
            this.hide_pop_up();

            LogicState.isMainScreen = false;
            this.autospin_panel.container.visible = true;
            this.total_bet.container.visible = false;
            this.sounds.container.visible = false;
            this.help.container.visible = false;
            this.history.container.visible = false;
        });

        document.addEventListener("open_history", () => {
            this.history.container.visible = true;
            this.history.open();
            this.total_bet.container.visible = false;
            this.sounds.container.visible = false;
            this.autospin_panel.container.visible = false;
            this.help.container.visible = false;
        });

        document.addEventListener("open_bet", () => {
            this.total_bet.container.visible = true;
            this.history.container.visible = false;
            this.sounds.container.visible = false;
            this.autospin_panel.container.visible = false;
            this.help.container.visible = false;
        });

        document.addEventListener("keyup", (event) => {
            if (
                event.code === "Space" &&
                LogicState.sm_state === "idle" &&
                LogicState.isMainScreen
            ) {
                document.dispatchEvent(EVENTS.spin_event);
            }
        });

        document.addEventListener("update_balance", (e) => {
            const detail = (e as CustomEvent).detail;

            this.balance_text!.text = `${get_localized_text(
                "mainui_balance"
            )} ${ECL.fmt.money(detail)}`;
        });

        if (LogicState.is_mobile) {
        }
    };

    toggleFullScreen = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fullscreen_element: any = document.body;
        if (!document.fullscreenElement) {
            if (fullscreen_element?.requestFullscreen) {
                fullscreen_element?.requestFullscreen();
            } else if (fullscreen_element?.mozRequestFullScreen) {
                fullscreen_element?.mozRequestFullScreen();
            } else if (fullscreen_element?.webkitRequestFullScreen) {
                fullscreen_element!.webkitRequestFullScreen();
            }

            // fullscreen_element!.requestFullscreen();
            LogicState.is_fullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                // @ts-ignore
            } else if (document.mozCancelFullScreen) {
                // @ts-ignore
                document.mozCancelFullScreen();
                // @ts-ignore
            } else if (document.webkitCancelFullScreen) {
                // @ts-ignore
                document.webkitCancelFullScreen();
            }
            LogicState.is_fullscreen = false;
        }
        LogicState.notify_all();
    };

    toggle_turbo = () => {
        if (LogicState.spin_mode === "base") {
            LogicState.spin_mode = "turbo";
        } else {
            LogicState.spin_mode = "base";
        }
        LogicState.notify_all();
    };

    closeGame = () => {
        console.log("clicked");
        if (ECL.urlD.getLobbyURL()) {
            window.location.href = ECL.urlD.getLobbyURL()!;
        }
    };

    activate_slam_stop = () => {
        LogicState.slam_stop = true;
        LogicState.notify_all();
    };

    on_resize = () => {
        console.log("!!!On_resize MainUI!!!");

        const appWidth = this.app.screen.width;
        const appHeight = this.app.screen.height;

        if (LogicState.is_mobile) {
            if (LogicState.is_landscape) {
                this.main_panel!.texture = ASSETS["UI_plate.png"];
                this.main_panel!.width = appWidth;
                this.main_panel!.height = 100;
                this.main_panel!.position.set(
                    this.app.screen.width / 2,
                    this.app.screen.height
                );

                this.bet_panel!.position.set(
                    appWidth - 430,
                    appHeight - this.main_panel!.height / 2
                );

                this.bet_panel_plus!.sprite.position.set(320, 0);
                this.bet_panel_minus!.sprite.position.set(0, 0);
                this.bet_panel_text!.position.set(160, 0);

                this.empty_spin!.sprite.position.set(1330, 386);
                this.empty_spin!.set_scale(1.24);

                this.spin!.sprite.position.set(1330, 386);
                this.spin!.set_scale(1.24);

                // this.spin!.sprite.hitArea = new PIXI.Circle(0, 0, 105.5);
                this.autospin_counter!.sprite.position.set(1330, 386);
                this.autospin_counter!.set_scale(1.24);

                this.slam_stop!.sprite.position.set(1330, 386);
                this.slam_stop!.set_scale(1.24);

                this.turbo!.sprite.position.set(1350, 568);
                this.turbo!.set_scale(1.24);
                this.turbo_stop!.sprite.position.set(1350, 568);
                this.turbo_stop!.set_scale(1.24);

                this.autoplay!.sprite.position.set(1350, 206);
                this.autoplay!.set_scale(1.24);
                this.autoplay_stop!.sprite.position.set(1350, 206);
                this.autoplay_stop!.set_scale(1.24);

                this.bet_panel!.scale.set(1);

                this.options_button!.sprite.position.set(62, 92);

                this.bg_black_panel!.texture = ASSETS["Top_Plate.png"];
                this.sound!.sprite.position.y = 12;
                this.sound_off!.sprite.position.y = 12;
                this.help_button!.sprite.position.y = 12;
                this.balance_text!.position.set(1440 / 2, 12);
                this.exit!.sprite.position.set(1425, 12);

                rescale_to_width(this.win_panel, 465);
                this.win_panel.position.set(
                    this.win_label_text!.width * this.win_panel.scale.x + 40,
                    appHeight - this.main_panel!.height / 2
                );

                this.win_panel.on_state_update = () => {};
            } else {
                const mainButtonsPadding = 186;

                const staticScale = 0.8;
                const maxScale = 1.29;
                const mainPanelHeight = 200;
                const diff = Math.min(appWidth / appHeight, 0.72);
                const scale =
                    staticScale / diff < maxScale
                        ? staticScale / diff
                        : maxScale;
                const mainCorY = appHeight - mainPanelHeight * scale;

                this.main_panel!.texture = ASSETS["UI_plate_mobile.png"];

                this.main_panel!.width = appWidth;
                this.main_panel!.position.set(appWidth / 2, appHeight);
                this.main_panel!.height = 175;

                [
                    this.spin,
                    this.slam_stop,
                    this.empty_spin,
                    this.autospin_counter,
                ].forEach((button) => {
                    button!.sprite.position.set(
                        this.main_panel!.width / 2,
                        mainCorY
                    );
                    button!.set_scale(scale);
                });

                [this.autoplay, this.autoplay_stop].forEach((button) => {
                    button!.sprite.position.set(
                        appWidth / 2 + mainButtonsPadding,
                        this.spin!.sprite.y
                    );
                    button!.set_scale(scale);
                });

                [this.turbo, this.turbo_stop].forEach((button) => {
                    button!.sprite.position.set(
                        appWidth / 2 - mainButtonsPadding,
                        this.spin!.sprite.y
                    );
                    button!.set_scale(scale);
                });

                this.bet_panel!.position.set(0, appHeight - 120);
                this.bet_panel_plus!.sprite.position.set(
                    this.autoplay!.sprite.x,
                    0
                );
                this.bet_panel_plus!.set_scale(scale);
                this.bet_panel_minus!.sprite.position.set(
                    this.turbo!.sprite.x,
                    0
                );
                this.bet_panel_minus!.set_scale(scale);
                this.bet_panel_text!.position.set(410, 0);

                this.win_label_text!.position.set(0, 0);
                this.win_text!.position.set(0, 0);

                this.win_panel.scale.set(1, 1);
                this.win_panel.on_state_update = () => {
                    this.win_panel.position.set(
                        this.main_panel!.width / 2 -
                            this.win_panel.width / 2 +
                            this.win_label_text!.width,
                        appHeight - 40
                    );
                };
                this.win_panel.on_state_update();

                this.bg_black_panel!.texture = ASSETS["Top_Plate_mobile.png"];
                this.sound!.sprite.position.y = 22;
                this.sound_off!.sprite.position.y = 22;
                this.help_button!.sprite.position.y = 22;
                this.balance_text!.position.set(810 / 2, 22);
                this.exit!.sprite.position.set(788, 22);
            }
        }
        this.sounds.on_resize();
        this.help.resize();
        this.autospin_panel.on_resize();
        this.history.on_resize();
        this.total_bet.on_resize();
    };
}
