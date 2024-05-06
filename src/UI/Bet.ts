import { ASSETS } from "../Assets";
import { Button } from "../Button";
import { EVENTS } from "../Events";
import { Observer } from "../Observer";
import { TextStyles } from "../TextStyles";
import { Slider } from "./Slider";

import { LogicState } from "../logic_state";
import { ECL } from "ecl";
import { rescale_to_width } from "../Util";
import { get_localized_text } from "../linguist";

export class Bet implements Observer {
    app: PIXI.Application;
    container: PIXI.Container;
    landscape_container: PIXI.Container;

    mask?: PIXI.Sprite;
    bg?: PIXI.Sprite;

    bet_button?: Button;
    history_button?: Button;
    sound_button?: Button;
    autospin_button?: Button;
    info_button?: Button;

    close_button?: Button;
    slider_music?: Slider;
    slider_sound?: Slider;

    buttons_containers?: PIXI.Container[];

    next_button?: Button;
    prev_button?: Button;

    current_page_index = 0;
    page_count = 0;
    pageNumber?: PIXI.Text;

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

    on_state_update = () => {};

    addEvents = () => {
        document.addEventListener("close_bet", () => {
            this.container.visible = false;
        });

        document.addEventListener("bet_next_event", () => {
            console.log("NEXT");
            if (this.current_page_index + 1 < this.page_count) {
                this.current_page_index++;
            }
            this.drawPageNumber();
            this.buttons_containers?.forEach((el, i) => {
                if (i === this.current_page_index) {
                    el.visible = true;
                } else {
                    el.visible = false;
                }
            });
            this.on_page_change();
        });

        document.addEventListener("bet_prev_event", () => {
            if (this.current_page_index > 0) {
                this.current_page_index--;
            }
            this.drawPageNumber();
            this.buttons_containers?.forEach((el, i) => {
                if (i === this.current_page_index) {
                    el.visible = true;
                } else {
                    el.visible = false;
                }
            });
            this.on_page_change();
        });
    };

    createElements = () => {
        this.createBackground();
        this.createMask();
        this.createTopButtons();
        this.addArrow();
        this.addHeader();
        this.addDividers();
        this.createNumberOfBet();
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
        this.bet_button = new Button(ASSETS["bet_active.png"], true);
        this.bet_button.hover_texture = ASSETS["bet_active.png"];
        this.bet_button.sprite.position.set(570, 80);
        // this.bet_button.event = EVENTS.open_bet;
        this.landscape_container.addChild(this.bet_button.sprite);

        this.autospin_button = new Button(
            ASSETS["autospin_inactive.png"],
            true
        );
        this.autospin_button.hover_texture = ASSETS["autospin_inactive.png"];
        this.autospin_button.sprite.position.set(420, 80);
        this.autospin_button.event = EVENTS.autoplay_btn_clicked;
        this.landscape_container.addChild(this.autospin_button.sprite);

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
        this.close_button.event = EVENTS.close_bet;
        this.landscape_container.addChild(this.close_button.sprite);
    };

    addArrow = () => {
        const arrow = new PIXI.Sprite(ASSETS["arrow.png"]);
        arrow.anchor.set(0.5);
        arrow.position.set(570, 126);
        this.landscape_container.addChild(arrow);
    };

    addHeader = () => {
        const sound = new PIXI.Text(
            get_localized_text("helpmenu_total_bet"),
            TextStyles.menu_title
        );
        sound.anchor.set(0.5);
        sound.position.set(720, 167);
        this.landscape_container.addChild(sound);
    };

    addDividers = () => {
        const divider = new PIXI.Sprite(ASSETS["Divider.png"]);
        divider.anchor.set(0.5);
        divider.position.set(720, 207);

        this.landscape_container.addChild(divider);
    };

    createNumberOfBet = () => {
        this.next_button = new Button(ASSETS["Right_button_over.png"]);
        this.next_button.hover_texture = ASSETS["Right_button_over.png"];
        this.next_button.pressed_texture = ASSETS["Right_button_over.png"];
        this.next_button.inactive_texture = ASSETS["Right_button.png"];
        this.next_button.sprite.position.set(780, 710);
        this.landscape_container.addChild(this.next_button.sprite);
        this.next_button.event = new Event("bet_next_event");

        this.prev_button = new Button(ASSETS["left_button_over.png"]);
        this.prev_button.hover_texture = ASSETS["left_button_over.png"];
        this.prev_button.pressed_texture = ASSETS["left_button_over.png"];
        this.prev_button.inactive_texture = ASSETS["left_button.png"];
        this.prev_button.sprite.position.set(660, 710);
        this.prev_button.inactivate_button();
        this.landscape_container.addChild(this.prev_button.sprite);
        this.prev_button.event = new Event("bet_prev_event");

        const count_of_containers = Math.ceil(
            LogicState.server_state!.wager_levels.length / 9
        );

        this.page_count = count_of_containers;

        this.on_page_change();

        const containers: PIXI.Container[] = [];

        for (let i = 0; i < count_of_containers; i++) {
            const buttons_container = new PIXI.Container();
            buttons_container.position.set(490, 310);
            containers.push(buttons_container);
        }

        this.buttons_containers = containers;

        this.buttons_containers.forEach((el, i) => {
            if (i !== 0) {
                el.visible = false;
            }
        });

        this.landscape_container.addChild(...containers);

        const buttons_container = new PIXI.Container();
        buttons_container.position.set(490, 310);
        this.landscape_container.addChild(buttons_container);

        for (let i = 0; i < LogicState.server_state!.wager_levels.length; i++) {
            const page_multiplier = Math.floor(i / 9);

            const btn = new Button(ASSETS["bet_btn_normal.png"], true);
            btn.hover_texture = ASSETS["bet_btn_over.png"];
            btn.pressed_texture = ASSETS["bet_btn_over.png"];
            btn.callback = () => {
                LogicState.level_index = i;
                LogicState.notify_all();
            };
            containers[page_multiplier].addChild(btn.sprite);

            const row = Math.floor(i / 3);
            const col = i % 3;

            btn.sprite.position.set(
                col * 230,
                row * 152 - 152 * 3 * page_multiplier
            );

            const value = LogicState.server_state!.wager_levels[i];

            const value_text = new PIXI.Text(
                ECL.fmt.money(value),
                TextStyles.autospin_numbers
            );

            value_text.anchor.set(0.5);
            rescale_to_width(value_text, 160);
            btn.sprite.addChild(value_text);
        }

        this.drawPageNumber();
    };

    on_page_change = () => {
        if (this.current_page_index + 1 === this.page_count) {
            this.next_button?.inactivate_button();
            this.prev_button?.activate_button();
        } else {
            this.prev_button?.inactivate_button();
            this.next_button?.activate_button();
        }

        if (this.page_count === 1) {
            console.log(this.page_count);
            this.prev_button?.inactivate_button();
            this.next_button?.inactivate_button();
        }
    };

    drawPageNumber = () => {
        if (this.current_page_index > -1) {
            this.landscape_container.removeChild(this.pageNumber!);
        }
        this.pageNumber = new PIXI.Text(
            `${(this.current_page_index + 1).toString()}/${this.page_count}`,
            TextStyles.help_page_numbers
        );
        this.pageNumber.position.set(720, 710);
        this.pageNumber.anchor.set(0.5);
        this.landscape_container.addChild(this.pageNumber);
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
