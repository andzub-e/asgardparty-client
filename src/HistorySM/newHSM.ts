import { Config } from "../Config";
import { LogicState } from "../logic_state";
import { ASSETS } from "../Assets";
import {
    HistorySpin,
    OldFormSpin,
    SpinStepResult,
    symbolsMatrix,
} from "../Models";
import { HistoryTopReel } from "./HistoryTopReel";
import { HistoryReel } from "./HistoryReel";
import { Button } from "../Button";
import { modify_spin_result } from "../MatrixForm";
import { HistorySymbol } from "./HistorySymbol";
import { ECL } from "ecl";
import { TextStyles } from "../TextStyles";
import { get_localized_text } from "../linguist";
import { grid_util } from "../Util";

export class newHSM {
    app: PIXI.Application;
    container: PIXI.Container;
    sm_container: PIXI.Container;
    reels: HistoryReel[] = [];

    extra_reels: HistoryTopReel[] = [];
    reels_bg?: PIXI.Sprite;
    extra_reels_mask?: PIXI.Graphics;
    reels_mask?: PIXI.Graphics;
    animated_extra_reels_mask?: PIXI.Graphics;

    topReel?: HistoryTopReel;

    spin: HistorySpin;

    leftPayLines?: Button;
    rightPayLines?: Button;
    counter = 0;
    modifySpin: OldFormSpin;
    symbolsArray: Array<Array<HistorySymbol & number>> = [];

    texts: PIXI.Text[] = [];

    winSymbols: PIXI.Sprite[] = [];

    constructor(app: PIXI.Application, spin: HistorySpin, fs_mark = false) {
        this.app = app;
        this.container = new PIXI.Container();
        this.container.position.set(0, 0);
        this.sm_container = new PIXI.Container();
        this.sm_container.scale.set(0.44);
        this.sm_container.position.set(510, 240);
        this.spin = spin;
        this.modifySpin = modify_spin_result(this.spin);

        this.build_reels();
        fs_mark && this.build_freesspin_marks();
        this.startNextSpinStep(this.modifySpin.steps[this.counter]);

        this.createArrowButtons();

        this.container.addChild(this.sm_container);
    }

    symbolChek = (winSymbols: string[], symbol: string) => {
        if (winSymbols.length === 0) {
            winSymbols.push(symbol);
        } else if (winSymbols.indexOf(symbol) === -1) {
            winSymbols.push(symbol);
        }

        return;
    };

    startNextSpinStep = (step: SpinStepResult) => {
        this.container.removeChild(...this.texts);
        this.createData();
        this.createTransaction();

        this.place_new_reels(step);

        this.fall_down_symbols(
            step,
            step.symbols_placed,
            step.falled_mystery,
            step.top_symbols_placed,
            step.top_falled_mystery
        );

        this.symbolsArray.forEach((symbol) => {
            symbol[0].darken();
        });

        if (step.winID!.length) {
            this.showWin();
        } else {
            this.showMistery();
        }
    };

    fall_down_symbols = (
        step: SpinStepResult,
        fromPositions: symbolsMatrix,
        toPositions: symbolsMatrix,
        topFromPositions: symbolsMatrix,
        topToPositions: symbolsMatrix
    ) => {
        if (!toPositions) return;
        for (let i = 0; i < Config.reels_count; i++) {
            this.reels[i].fall_down_top_symbols(
                step,
                fromPositions,
                toPositions
            );
        }
        this.topReel!.fall_down_top_symbols(
            step,
            topFromPositions,
            topToPositions
        );
    };

    showMistery = () => {
        this.symbolsArray.forEach((symbol) => {
            if (symbol[1] === -1) {
                symbol[0].brighten();
            }
        });
    };

    showWin = () => {
        this.modifySpin.steps[this.counter].winID!.forEach((id) => {
            this.symbolsArray.forEach((symbol) => {
                if (symbol[1] === id) {
                    symbol[0].brighten();
                }
            });
        });
    };

    place_new_reels = (step: SpinStepResult) => {
        this.topReel!.place_new_symbols(step, this.symbolsArray);

        for (let i = 0; i < Config.reels_count; i++) {
            this.reels[i].place_new_symbols(step, this.symbolsArray);
        }
    };

    build_reels = () => {
        this.reels_bg = new PIXI.Sprite(ASSETS["ReelFrame"]);
        this.reels_bg.position.y = -103;
        this.sm_container.addChild(this.reels_bg!);

        this.build_masks();

        const bottomExtraSymbolsContainer = new PIXI.Container();
        this.sm_container.addChild(bottomExtraSymbolsContainer);

        const topExtraSymbolsContainer = new PIXI.Container();
        this.sm_container.addChild(topExtraSymbolsContainer);

        topExtraSymbolsContainer.mask = bottomExtraSymbolsContainer.mask = this
            .extra_reels_mask as PIXI.Graphics;

        topExtraSymbolsContainer.y = bottomExtraSymbolsContainer.y =
            -Config.out_of_top_symbols_count * Config.symbol_height + 140;

        const extraReelsPosition = new PIXI.Point(
            Config.symbol_width * 0 + Config.symbol_width / 2 + 318,
            Config.symbol_height / 2 - 57
        );

        topExtraSymbolsContainer.position.copyFrom(extraReelsPosition);
        bottomExtraSymbolsContainer.position.copyFrom(extraReelsPosition);

        // add top reels
        this.topReel = new HistoryTopReel(
            this.app,
            topExtraSymbolsContainer,
            bottomExtraSymbolsContainer
        );

        const bottomSymbolsContainer = new PIXI.Container();
        this.sm_container.addChild(bottomSymbolsContainer);

        const topSymbolsContainer = new PIXI.Container();
        this.sm_container.addChild(topSymbolsContainer);

        topSymbolsContainer.mask = bottomSymbolsContainer.mask = this
            .reels_mask as PIXI.Graphics;

        topSymbolsContainer.y = bottomSymbolsContainer.y =
            -Config.out_of_top_symbols_count * Config.symbol_height + 140;

        //add main containers
        for (let i = 0; i < Config.reels_count; i++) {
            const reel = new HistoryReel(
                this.app,
                i,
                undefined,
                topSymbolsContainer,
                bottomSymbolsContainer
            );
            this.reels[i] = reel;
        }
    };

    build_freesspin_marks = () => {
        const freeSpinMark = new PIXI.Text(
            get_localized_text("helpmenu_fs"),
            TextStyles.free_spins
        );
        freeSpinMark.anchor.set(0.5, 0);
        freeSpinMark.position.set(475, 590);
        this.sm_container.addChild(freeSpinMark);
    };

    indexCheck = () => {
        if (this.modifySpin.steps.length === 1) {
            this.rightPayLines!.sprite.interactive = false;
            this.leftPayLines!.sprite.interactive = false;

            this.rightPayLines!.sprite.alpha = 0.3;
            this.leftPayLines!.sprite.alpha = 0.3;
        }

        if (this.counter === 0) {
            this.leftPayLines!.sprite.interactive = false;
            this.leftPayLines!.sprite.alpha = 0.3;
        }

        if (this.counter === this.modifySpin.steps.length - 1) {
            this.rightPayLines!.sprite.interactive = false;
            this.rightPayLines!.sprite.alpha = 0.3;
        }
    };

    createArrowButtons = () => {
        this.leftPayLines = new Button(ASSETS["left_button.png"], true);
        this.leftPayLines.hover_texture = ASSETS["left_button_over.png"];
        this.leftPayLines.sprite.position.set(-40, 320);
        this.leftPayLines.set_scale(2);
        this.leftPayLines.callback = () => {
            this.counter--;
            this.indexCheck();
            this.rightPayLines!.sprite.interactive = true;
            this.rightPayLines!.sprite.alpha = 1;

            this.symbolsArray.forEach((symbol) => symbol[0].cleanup());
            this.symbolsArray.length = 0;

            this.startNextSpinStep(this.modifySpin.steps[this.counter]);
        };
        this.sm_container.addChild(this.leftPayLines.sprite);

        this.rightPayLines = new Button(ASSETS["Right_button.png"], true);
        this.rightPayLines.hover_texture = ASSETS["Right_button_over.png"];
        this.rightPayLines.sprite.position.set(985, 320);
        this.rightPayLines.set_scale(2);
        this.rightPayLines.callback = () => {
            this.counter++;
            this.indexCheck();
            this.leftPayLines!.sprite.interactive = true;
            this.leftPayLines!.sprite.alpha = 1;

            this.symbolsArray.forEach((symbol) => symbol[0].cleanup());
            this.symbolsArray.length = 0;

            this.startNextSpinStep(this.modifySpin.steps[this.counter]);
        };
        this.indexCheck();
        this.sm_container.addChild(this.rightPayLines.sprite);
    };

    build_masks = () => {
        this.extra_reels_mask = new PIXI.Graphics();
        this.extra_reels_mask.beginFill();
        this.extra_reels_mask.drawRect(
            318,
            -55,
            Config.symbol_width * 3,
            Config.symbol_height
        );
        this.sm_container.addChild(this.extra_reels_mask);

        this.animated_extra_reels_mask = new PIXI.Graphics();
        this.animated_extra_reels_mask.beginFill();
        this.animated_extra_reels_mask.drawRect(
            303,
            -70,
            Config.symbol_width * 3 + 30,
            Config.symbol_height + 30
        );
        this.animated_extra_reels_mask.visible = false;
        this.sm_container.addChild(this.animated_extra_reels_mask);

        this.reels_mask = new PIXI.Graphics();
        this.reels_mask.beginFill();
        this.reels_mask.drawRect(
            100,
            55,
            Config.symbol_width * Config.reels_count + 20,
            Config.symbol_height * Config.symbols_count + 2
        );
        this.sm_container.addChildAt(this.reels_mask, 0);
    };

    createTransaction = () => {
        const header_label = new PIXI.Text(
            get_localized_text("helpmenu_history_1"),
            TextStyles.settings_history_header
        );
        header_label.anchor.set(0, 0.5);

        const label_balance_before = new PIXI.Text(
            get_localized_text("helpmenu_history_3"),
            TextStyles.settings_history_label
        );
        label_balance_before.anchor.set(0, 0.5);

        const total_bet_label = new PIXI.Text(
            get_localized_text("helpmenu_history_4"),
            TextStyles.settings_history_label
        );
        total_bet_label.anchor.set(0, 0.5);

        const total_win_label = new PIXI.Text(
            get_localized_text("mainui_win"),
            TextStyles.settings_history_label
        );
        total_win_label.anchor.set(0, 0.5);

        const balance_after_label = new PIXI.Text(
            get_localized_text("helpmenu_history_5"),
            TextStyles.settings_history_label
        );
        balance_after_label.anchor.set(0, 0.5);

        const balance_before = new PIXI.Text(
            `${ECL.fmt.money(this.spin.balance)}`,
            TextStyles.settings_history_value
        );
        balance_before.anchor.set(0, 0.5);

        const total_bet = new PIXI.Text(
            ECL.fmt.money(this.spin.bet),
            TextStyles.settings_history_value
        );
        total_bet.anchor.set(0, 0.5);

        const total_win = new PIXI.Text(
            ECL.fmt.money(this.spin.base_pay),
            TextStyles.settings_history_value
        );
        total_win.anchor.set(0, 0.5);

        const balance_after = new PIXI.Text(
            ECL.fmt.money(this.spin.final_balance),
            TextStyles.settings_history_value
        );
        balance_after.anchor.set(0, 0.5);

        const objects = [
            header_label,
            null,
            label_balance_before,
            balance_before,
            total_bet_label,
            total_bet,
            total_win_label,
            total_win,
            balance_after_label,
            balance_after,
        ];
        const texts = objects.filter((item) => item) as PIXI.Text[];
        this.texts.push(...texts);
        this.container.addChild(...texts);
        grid_util(objects, 2, 390, 540, 220, 20, (text, x, y, i) => {
            if (i == 0) text?.position.set(x, y - 5);
            else text?.position.set(x, y);
        });
    };

    createData = () => {
        const data_header = new PIXI.Text(
            get_localized_text("helpmenu_history_6"),
            TextStyles.settings_history_header
        );
        data_header.anchor.set(0, 0.5);

        const transaction_label = new PIXI.Text(
            get_localized_text("helpmenu_history_2"),
            TextStyles.settings_history_label
        );
        transaction_label.anchor.set(0, 0.5);

        const transaction_value = new PIXI.Text(
            this.spin.transaction_id,
            TextStyles.settings_history_value
        );
        transaction_value.anchor.set(0, 0.5);

        const startStr = (new Date(this.spin.start_time * 1000) + "").slice(
            15,
            25
        );
        const endStr = (new Date(this.spin.finish_time * 1000) + "").slice(
            15,
            25
        );

        const time_value = new PIXI.Text(
            `${get_localized_text(
                "help_start"
            )}: ${startStr} ${get_localized_text("help_end")}: ${endStr}`,
            TextStyles.settings_history_value
        );
        time_value.anchor.set(0, 0.5);

        const round_value = new PIXI.Text(
            this.spin.round_id,
            TextStyles.settings_history_value
        );
        round_value.anchor.set(0, 0.5);

        const dataHeader_value = new PIXI.Text(
            get_localized_text("helpmenu_history_6"),
            TextStyles.settings_history_header
        );
        dataHeader_value.anchor.set(0, 0.5);

        const time_label = new PIXI.Text(
            get_localized_text("helpmenu_history_7"),
            TextStyles.settings_history_label
        );
        time_label.anchor.set(0, 0.5);

        const round_label = new PIXI.Text(
            get_localized_text("helpmenu_history_8"),
            TextStyles.settings_history_label
        );
        round_label.anchor.set(0, 0.5);

        const objects = [
            data_header,
            transaction_label,
            transaction_value,
            time_label,
            time_value,
            round_label,
            round_value,
        ];

        const texts = objects.filter((item) => item) as PIXI.Text[];
        this.texts.push(...texts);

        this.container.addChild(...texts);

        grid_util(objects, 1, 750, 540, 180, 20, (text, x, y, i) => {
            if (i == 0) text?.position.set(x, y - 5);
            else text?.position.set(x, y);
        });
    };

    resize = () => {
        if (LogicState.is_mobile) {
            if (LogicState.is_landscape) {
                Config.reels_x = (1440 - 191 * 5) / 2;
                Config.reels_y = 124;

                this.container.scale.set(0.95);
                this.container.position.set(
                    720 - this.container.width / 2,
                    120
                );
            } else {
                Config.reels_x = 0;
                Config.reels_y = this.app.screen.height / 2 - 300;

                const scale = 0.85;

                this.container.scale.set(scale, scale);
                this.container.position.set(Config.reels_x, Config.reels_y);
            }
        }
    };
}
