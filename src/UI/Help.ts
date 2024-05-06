import { Button } from "../Button";
import { Config } from "../Config";
import { LogicState } from "../logic_state";
import { TextStyles } from "../TextStyles";
import { ASSETS } from "../Assets";
import { EVENTS } from "../Events";
import { ECL } from "ecl";
import { get_language, get_localized_text, TextKeys } from "../linguist";
import PIXI from "pixi.js";
export class Help {
    app: PIXI.Application;
    container: PIXI.Container;
    landscape_container: PIXI.Container;
    portrait_container?: PIXI.Container;
    knobs: PIXI.Sprite[] = [];
    current_page = 0;
    pages: PIXI.Container[] = [];

    prev_button?: Button;
    next_button?: Button;

    // payouts: PIXI.Text[] = [];
    payouts_mobile: PIXI.Text[] = [];

    pageNumber?: PIXI.Text;
    mask?: PIXI.Sprite;
    payout_values: PIXI.Text[] = [];

    constructor(app: PIXI.Application) {
        this.app = app;

        this.container = new PIXI.Container();
        this.container.visible = false;
        this.container.interactive = true;

        this.landscape_container = new PIXI.Container();
        this.container.addChild(this.landscape_container);

        this.build_common();
        this.build_page_1();
        this.build_page_2();
        this.build_page_3();
        this.build_page_4();
        this.build_page_5();
        this.build_page_6();

        document.addEventListener("help_close_event", () => {
            this.container.visible = false;
            LogicState.isMainScreen = true;
        });
        document.addEventListener("help_next_event", this.on_next_page_event);
        document.addEventListener("help_prev_event", this.on_prev_page_event);
    }

    build_common = () => {
        this.mask = new PIXI.Sprite(
            PIXI.Loader.shared.resources["shadow"].texture
        );
        this.mask.zIndex = -1;
        this.mask.interactive = true;
        this.mask.on("pointerdown", () => {
            this.container.visible = false;
        });
        this.container.addChild(this.mask);

        const help_panel = new PIXI.Sprite(
            PIXI.Loader.shared.resources["bg_menu"].texture
        );
        help_panel.interactive = true;
        help_panel.anchor.set(0.5);
        help_panel.position.set(720, 393.5);
        this.landscape_container.addChild(help_panel);

        const info_button = new Button(ASSETS["info_active.png"], true);
        info_button.hover_texture = ASSETS["info_active.png"];
        info_button.sprite.position.set(720, 80);
        // this.autospin_button.event = EVENTS.close_autospin_settings;
        this.landscape_container.addChild(info_button.sprite);

        const autospin_button = new Button(
            ASSETS["autospin_inactive.png"],
            true
        );
        autospin_button.hover_texture = ASSETS["autospin_inactive.png"];
        autospin_button.sprite.position.set(420, 80);
        autospin_button.event = EVENTS.autoplay_btn_clicked;
        this.landscape_container.addChild(autospin_button.sprite);

        const bet_button = new Button(ASSETS["bet_inactive.png"], true);
        bet_button.hover_texture = ASSETS["bet_inactive.png"];
        bet_button.sprite.position.set(570, 80);
        bet_button.event = EVENTS.open_bet;
        this.landscape_container.addChild(bet_button.sprite);

        const sound_button = new Button(ASSETS["sound_inactive.png"], true);
        sound_button.hover_texture = ASSETS["sound_inactive.png"];
        sound_button.sprite.position.set(870, 80);
        sound_button.event = EVENTS.open_settings;
        this.landscape_container.addChild(sound_button.sprite);

        const history_button = new Button(ASSETS["history_inactive.png"], true);
        history_button.hover_texture = ASSETS["history_inactive.png"];
        history_button.sprite.position.set(1020, 80);
        history_button.event = EVENTS.open_history;
        this.landscape_container.addChild(history_button.sprite);

        const exit = new Button(ASSETS["Exit_button.png"]);
        exit.hover_texture = ASSETS["Exit_button.png"];
        exit.sprite.position.set(1077, 51);
        this.landscape_container.addChild(exit.sprite);
        exit.event = new Event("help_close_event");

        const arrow = new PIXI.Sprite(ASSETS["arrow.png"]);
        arrow.anchor.set(0.5);
        arrow.position.set(720, 126);
        this.landscape_container.addChild(arrow);

        this.next_button = new Button(ASSETS["Right_button_over.png"]);
        this.next_button.hover_texture = ASSETS["Right_button_over.png"];
        this.next_button.pressed_texture = ASSETS["Right_button_over.png"];
        this.next_button.inactive_texture = ASSETS["Right_button.png"];
        this.next_button.sprite.position.set(780, 710);
        this.landscape_container.addChild(this.next_button.sprite);
        this.next_button.event = new Event("help_next_event");

        this.prev_button = new Button(ASSETS["left_button_over.png"]);
        this.prev_button.hover_texture = ASSETS["left_button_over.png"];
        this.prev_button.pressed_texture = ASSETS["left_button_over.png"];
        this.prev_button.inactive_texture = ASSETS["left_button.png"];
        this.prev_button.sprite.position.set(660, 710);
        this.prev_button.inactivate_button();
        this.landscape_container.addChild(this.prev_button.sprite);
        this.prev_button.event = new Event("help_prev_event");

        this.drawPageNumber();
    };

    build_page_1 = () => {
        const page = new PIXI.Container();
        this.pages[0] = page;
        this.landscape_container.addChild(page);

        const page_title = new PIXI.Text(
            get_localized_text("helpmenu_paytable"),
            TextStyles.menu_title
        );
        page_title.anchor.set(0.5);
        page_title.position.set(720, 167);
        page.addChild(page_title);

        const scale = 0.6;

        const symbol_cross = new PIXI.Sprite(ASSETS["Hi2_Symbol.png"]);
        symbol_cross.position.set(370, 500);

        symbol_cross.scale.set(scale);
        page.addChild(symbol_cross);

        const streak_text_cross = new PIXI.Text(
            "4x-\n5x-\n6x-\n7x-",
            TextStyles.paytable_streak
        );
        streak_text_cross.position.set(
            symbol_cross.x + symbol_cross.width + 10,
            symbol_cross.y + symbol_cross.height / 2
        );
        streak_text_cross.anchor.set(0, 0.5);
        page.addChild(streak_text_cross);

        const amount_text_cross = new PIXI.Text("", TextStyles.paytable_amount);
        amount_text_cross.position.set(
            streak_text_cross.x + streak_text_cross.width + 10,
            streak_text_cross.y
        );
        amount_text_cross.anchor.set(0, 0.5);
        page.addChild(amount_text_cross);
        this.payout_values.push(amount_text_cross);

        const symbol_hammer = new PIXI.Sprite(ASSETS["Hi1_Symbol.png"]);
        symbol_hammer.position.set(720, 270);

        symbol_hammer.scale.set(scale);
        page.addChild(symbol_hammer);

        const streak_text_hammer = new PIXI.Text(
            "4x-\n5x-\n6x-\n7x-",
            TextStyles.paytable_streak
        );
        streak_text_hammer.position.set(
            symbol_hammer.x + symbol_hammer.width - 30,
            symbol_hammer.y + symbol_hammer.height / 2 - 20
        );
        streak_text_hammer.anchor.set(0, 0.5);
        page.addChild(streak_text_hammer);

        const amount_text_hammer = new PIXI.Text(
            "",
            TextStyles.paytable_amount
        );
        amount_text_hammer.position.set(
            streak_text_hammer.x + streak_text_hammer.width + 10,
            streak_text_hammer.y
        );
        amount_text_hammer.anchor.set(0, 0.5);
        page.addChild(amount_text_hammer);
        this.payout_values.push(amount_text_hammer);

        const symbol_thor = new PIXI.Sprite(ASSETS["Hi3_Symbol_2x3.png"]);
        symbol_thor.position.set(410, 200);

        symbol_thor.scale.set(scale);
        page.addChild(symbol_thor);

        const streak_text_thor = new PIXI.Text(
            "4x-\n5x-\n6x-\n7x-",
            TextStyles.paytable_streak
        );
        streak_text_thor.position.set(
            symbol_thor.x + symbol_thor.width + 10,
            symbol_thor.y + symbol_thor.height / 2
        );
        streak_text_thor.anchor.set(0, 0.5);
        page.addChild(streak_text_thor);

        const amount_text_thor = new PIXI.Text("", TextStyles.paytable_amount);
        amount_text_thor.position.set(
            streak_text_thor.x + streak_text_thor.width + 10,
            streak_text_thor.y
        );
        amount_text_thor.anchor.set(0, 0.5);
        page.addChild(amount_text_thor);
        this.payout_values.push(amount_text_thor);
    };

    build_page_2 = () => {
        const page = new PIXI.Container();
        this.pages[1] = page;
        page.visible = false;
        this.landscape_container.addChild(page);

        const page_title = new PIXI.Text(
            get_localized_text("helpmenu_paytable"),
            TextStyles.menu_title
        );
        page_title.anchor.set(0.5);
        page_title.position.set(720, 167);
        page.addChild(page_title);

        const scale = 1.25;
        let index = 0;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                const symbol = new PIXI.Sprite(
                    ASSETS[Config.info_textures_keys[index]]
                );
                symbol.position.set(j * 360 + 370, i * 160 + 200);

                symbol.scale.set(scale);
                page.addChild(symbol);

                const streak_text = new PIXI.Text(
                    "4x-\n5x-\n6x-\n7x-",
                    TextStyles.paytable_streak
                );
                streak_text.position.set(
                    symbol.x + symbol.width + 10,
                    symbol.y + symbol.height / 2
                );
                streak_text.anchor.set(0, 0.5);
                page.addChild(streak_text);

                const amount_text = new PIXI.Text(
                    "",
                    TextStyles.paytable_amount
                );
                amount_text.position.set(
                    streak_text.x + streak_text.width + 10,
                    streak_text.y
                );
                amount_text.anchor.set(0, 0.5);
                page.addChild(amount_text);
                this.payout_values.push(amount_text);
                index++;
            }
        }

        this.payout_values.reverse();
        for (let i = 0; i < 9; i++) {
            Config.payments[i as keyof typeof Config.payments].reverse();
        }
    };

    build_page_3 = () => {
        const page = new PIXI.Container();
        this.pages[2] = page;
        page.visible = false;
        this.landscape_container.addChild(page);

        const scale = 1.25;

        const page_title = new PIXI.Text(
            get_localized_text("helpmenu_special_symbols"),
            TextStyles.menu_title
        );
        page_title.anchor.set(0.5);
        page_title.position.set(720, 167);
        page.addChild(page_title);

        const scatter_symbol = new PIXI.Sprite(ASSETS["Bonus_Symbol.png"]);
        scatter_symbol.scale.set(scale);
        scatter_symbol.position.set(385, 200);
        page.addChild(scatter_symbol);

        const wild_symbol = new PIXI.Sprite(ASSETS["Wild_Symbol.png"]);
        wild_symbol.scale.set(scale);
        wild_symbol.position.set(385, 355);
        page.addChild(wild_symbol);

        const mystery_symbol = new PIXI.Sprite(
            ASSETS["Mystery_Symbol_1х1.png"]
        );
        mystery_symbol.scale.set(scale);
        mystery_symbol.position.set(385, 510);
        page.addChild(mystery_symbol);

        const free_spins = new PIXI.Text(
            get_localized_text("helpmenu_free_spins"),
            TextStyles.help_page3_symbols
        );
        free_spins.anchor.x = 0;
        free_spins.position.set(390, 325);
        page.addChild(free_spins);

        const wild = new PIXI.Text(
            get_localized_text("helpmenu_wild"),
            TextStyles.help_page3_symbols
        );
        wild.anchor.x = 0;
        wild.position.set(390, 480);
        page.addChild(wild);

        const mystery = new PIXI.Text(
            get_localized_text("helpmenu_mystery"),
            TextStyles.help_page3_symbols
        );
        mystery.anchor.x = 0;
        mystery.position.set(390, 640);
        page.addChild(mystery);

        const scatter_text = new PIXI.Text(
            get_localized_text("helpmenu_free_spins_body"),
            TextStyles.help_page2
        );
        scatter_text.anchor.y = 0.5;
        scatter_text.position.set(
            scatter_symbol.x + scatter_symbol.width + 10,
            scatter_symbol.y + scatter_symbol.height / 2
        );
        page.addChild(scatter_text);

        const wild_text = new PIXI.Text(
            get_localized_text("helpmenu_wild_body"),
            TextStyles.help_page2
        );
        wild_text.anchor.y = 0.5;
        wild_text.position.set(
            wild_symbol.x + wild_symbol.width + 10,
            wild_symbol.y + wild_symbol.height / 2
        );
        page.addChild(wild_text);

        const mystery_text = new PIXI.Text(
            get_localized_text("popup_3"),
            TextStyles.help_page2
        );
        mystery_text.anchor.y = 0.5;
        mystery_text.position.set(
            mystery_symbol.x + mystery_symbol.width + 10,
            mystery_symbol.y + mystery_symbol.height / 2
        );
        page.addChild(mystery_text);
    };

    build_page_4 = () => {
        const page = new PIXI.Container();
        page.visible = false;
        this.pages[3] = page;
        this.landscape_container.addChild(page);

        const page_title = new PIXI.Text(
            get_localized_text("continue_winning_bet_lines"),
            TextStyles.menu_title
        );
        page_title.anchor.set(0.5);
        page_title.position.set(720, 167);
        page.addChild(page_title);

        const dot_1 = new PIXI.Sprite(ASSETS["dot.png"]);
        dot_1.anchor.y = 0.5;
        dot_1.position.set(370, 215);
        page.addChild(dot_1);

        const rule_1 = new PIXI.Text(
            get_localized_text("helpmenu_win_bet_lines_body_1"),
            TextStyles.help_page2
        );
        rule_1.anchor.y = 0.5;
        rule_1.position.set(387, 215);
        page.addChild(rule_1);

        const win_example = new PIXI.Sprite(ASSETS["leftimage.png"]);
        win_example.position.set(385, 240);
        page.addChild(win_example);

        const wrong_example = new PIXI.Sprite(ASSETS["right_image.png"]);
        wrong_example.position.set(750, 240);
        page.addChild(wrong_example);

        const dot_2 = new PIXI.Sprite(ASSETS["dot.png"]);
        dot_2.anchor.y = 0.5;
        dot_2.position.set(370, 530);
        page.addChild(dot_2);

        const rule_2 = new PIXI.Text(
            get_localized_text("helpmenu_win_bet_lines_body_2"),
            TextStyles.help_page2
        );
        rule_2.anchor.y = 0.5;
        rule_2.position.set(387, 530);
        page.addChild(rule_2);

        const dot_3 = new PIXI.Sprite(ASSETS["dot.png"]);
        dot_3.anchor.y = 0.5;
        dot_3.position.set(370, 585);
        page.addChild(dot_3);

        const rule_3 = new PIXI.Text(
            get_localized_text("helpmenu_win_bet_lines_body_3"),
            TextStyles.help_page2
        );
        rule_3.anchor.y = 0.5;
        rule_3.position.set(387, 585);
        page.addChild(rule_3);

        const example = new PIXI.Text(
            get_localized_text("continue_from_example"),
            TextStyles.help_page4_symbols
        );
        example.anchor.set(0.5);
        example.position.set(720, 620);
        page.addChild(example);

        const example_count = new PIXI.Text(
            `4x4x2x2=64`,
            TextStyles.help_page4
        );
        example_count.anchor.set(0.5);
        example_count.position.set(720, 650);
        page.addChild(example_count);
    };

    update_payouts = () => {
        const bet_multiplier = LogicState.getBet() / 100;
        console.log(this.payout_values.length);
        this.payout_values.forEach((element, index) => {
            element.text = `${ECL.fmt.money(
                bet_multiplier *
                    Config.payments[index as keyof typeof Config.payments][3]
            )}\n${ECL.fmt.money(
                bet_multiplier *
                    Config.payments[index as keyof typeof Config.payments][2]
            )}\n${ECL.fmt.money(
                bet_multiplier *
                    Config.payments[index as keyof typeof Config.payments][1]
            )}\n${ECL.fmt.money(
                bet_multiplier *
                    Config.payments[index as keyof typeof Config.payments][0]
            )}`;

            // rescale_to_width(this.payout_containers[index], 175);
        });
    };

    build_page_5 = () => {
        const page = new PIXI.Container();
        this.pages[4] = page;
        page.visible = false;
        this.landscape_container.addChild(page);

        const page_title = new PIXI.Text(
            get_localized_text("helpmenu_winning_bet_lines"),
            TextStyles.menu_title
        );
        page_title.anchor.set(0.5);
        page_title.position.set(720, 167);
        page.addChild(page_title);

        const dot_1 = new PIXI.Sprite(ASSETS["dot.png"]);
        dot_1.anchor.y = 0.5;
        dot_1.position.set(370, 215);
        page.addChild(dot_1);

        const rule_1 = new PIXI.Text(
            get_localized_text("helpmenu_win_bet_lines_body_4"),
            TextStyles.help_page2
        );
        rule_1.anchor.y = 0.5;
        rule_1.position.set(387, 215);
        page.addChild(rule_1);

        const symbol_thor = new PIXI.Sprite(ASSETS["Hi3_Symbol_2x3.png"]);
        symbol_thor.position.set(600, 240);
        symbol_thor.scale.set(0.71);
        page.addChild(symbol_thor);

        const streak_text_thor = new PIXI.Text(
            "4x - \n5x - \n6x - \n7x - ",
            TextStyles.paytable_streak
        );
        streak_text_thor.position.set(
            symbol_thor.x + symbol_thor.width + 10,
            symbol_thor.y + symbol_thor.height / 2
        );
        streak_text_thor.anchor.set(0, 0.5);
        page.addChild(streak_text_thor);
        const amount_text = new PIXI.Text(
            "40\n50\n60\n70",
            TextStyles.paytable_amount
        );
        amount_text.position.set(
            streak_text_thor.x + streak_text_thor.width + 10,
            streak_text_thor.y
        );
        amount_text.anchor.set(0, 0.5);
        page.addChild(amount_text);

        const dot_2 = new PIXI.Sprite(ASSETS["dot.png"]);
        dot_2.anchor.y = 0.5;
        dot_2.position.set(370, 565);
        page.addChild(dot_2);

        const rule_2 = new PIXI.Text(
            get_localized_text("helpmenu_win_bet_lines_body_5"),
            TextStyles.help_page2
        );
        rule_2.anchor.y = 0.5;
        rule_2.position.set(387, 570);
        page.addChild(rule_2);

        const example = new PIXI.Text(
            get_localized_text("continue_from_example"),
            TextStyles.help_page4_symbols
        );
        example.anchor.set(0.5);
        example.position.set(720, 620);
        page.addChild(example);

        const example_count = new PIXI.Text(
            `64x40=2560`,
            TextStyles.help_page4
        );
        example_count.anchor.set(0.5);
        example_count.position.set(720, 650);
        page.addChild(example_count);
    };

    build_page_6 = () => {
        const page = new PIXI.Container();
        this.pages[5] = page;
        page.visible = false;
        this.landscape_container.addChild(page);

        const page_title = new PIXI.Text(
            get_localized_text("helpmenu_general_rules"),
            TextStyles.menu_title
        );
        page_title.anchor.set(0.5);
        page_title.position.set(720, 167);
        page.addChild(page_title);

        let txt = "";
        for (let i = 1; i < 16; i++) {
            txt +=
                get_localized_text(`helpmenu_general_rules_${i}` as TextKeys) +
                "\n";
        }
        this.addRulesTxt(txt, page);
    };

    addRulesTxt = (str: string, parent: PIXI.Container) => {
        const rule_1 = new PIXI.Text(str, TextStyles.help_page_rules);
        rule_1.anchor.y = 0;
        rule_1.position.set(387, 200);
        const textMetrics = PIXI.TextMetrics.measureText(
            rule_1!.text,
            TextStyles.win_value
        );
        if (textMetrics.width > 360) {
            rule_1!.scale.x = 0.8;
            rule_1!.scale.y = 0.8;
        } else {
            rule_1!.scale.x = 1;
            rule_1!.scale.y = 1;
        }
        parent.addChild(rule_1);
    };

    on_next_page_event = () => {
        this.pages[this.current_page].visible = false;
        this.current_page++;

        this.pages[this.current_page].visible = true;

        this.prev_button?.activate_button();

        if (this.current_page === this.pages.length - 1) {
            this.next_button?.inactivate_button();
        }
        this.drawPageNumber();
    };

    on_prev_page_event = () => {
        this.pages[this.current_page].visible = false;

        this.current_page--;

        this.pages[this.current_page].visible = true;

        this.next_button?.activate_button();

        if (this.current_page === 0) {
            this.prev_button?.inactivate_button();
        }
        this.drawPageNumber();
    };

    drawPageNumber = () => {
        if (this.current_page > -1) {
            this.landscape_container.removeChild(this.pageNumber!);
        }
        this.pageNumber = new PIXI.Text(
            `${(this.current_page + 1).toString()}/6`,
            TextStyles.help_page_numbers
        );
        this.pageNumber.position.set(720, 710);
        this.pageNumber.anchor.set(0.5);
        this.landscape_container.addChild(this.pageNumber);
    };

    resize = () => {
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
