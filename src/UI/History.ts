import { ASSETS } from "../Assets";
import { Button } from "../Button";
import { EVENTS } from "../Events";
import { Observer } from "../Observer";
import { TextStyles } from "../TextStyles";
import { LogicState } from "../logic_state";
import { get_history } from "../Controller";
import { newHSM } from "../HistorySM/newHSM";
import { get_localized_text } from "../linguist";

export class History implements Observer {
    public container: PIXI.Container;

    private app: PIXI.Application;
    private landscape_container: PIXI.Container;

    private mask?: PIXI.Sprite;
    private bg?: PIXI.Sprite;

    private history_button?: Button;
    private bet_button?: Button;
    private sound_button?: Button;
    private autospin_button?: Button;
    private info_button?: Button;

    private close_button?: Button;

    private no_history?: PIXI.Text;
    private loadingText?: PIXI.Text;

    private spinsText!: PIXI.Text;
    private leftHistory?: Button;
    private rightHistory?: Button;

    private header?: PIXI.Text;

    private arrayOfSM: newHSM[] = [];

    private visiblePage = 0;
    private totalPages = 0;
    private bonusPages = 0;
    private maxPages = 5;

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

    open = async () => {
        this.visiblePage = 0;
        this.totalPages = 0;
        this.bonusPages = 0;

        this.clear();

        this.arrayOfSM.length = 0;
        this.container.visible = true;

        this.show_hide_info();

        await this.loadHistory();
        await this.setPage(0);
    };

    clear = () => {
        this.arrayOfSM.forEach((sm) => {
            this.landscape_container.removeChild(sm.container);
        });

        this.container.visible = false;
        this.show_hide_info(false);
    };

    addEvents = () => {
        document.addEventListener("close_history", this.clear);
    };

    on_state_update = () => {};

    createElements = () => {
        this.createBackground();
        this.createMask();
        this.createTopButtons();
        this.addArrow();
        this.addHeader();
        this.createNoHistory();
        this.createLoadingText();
        this.createTransaction();
        this.createArrowButtons();
        this.show_hide_info(false);
    };

    createNoHistory = () => {
        this.no_history = new PIXI.Text(
            get_localized_text("helpmenu_history_no")
        );
        this.no_history.style = new PIXI.TextStyle({
            align: "center",
            dropShadow: true,
            dropShadowAngle: 120.1,
            dropShadowBlur: 1,
            dropShadowDistance: 4,
            fill: ["#ffed24"],
            fontFamily: "Calibri Bold",
            fontSize: 45,
            miterLimit: 0,
            stroke: "white",
            wordWrapWidth: 0,
        });
        this.no_history.anchor.set(0, 0.5);
        this.no_history.visible = true;
        this.no_history.position.set(1440 / 2 - this.no_history.width / 2, 410);
        this.landscape_container.addChild(this.no_history);
    };

    createLoadingText = () => {
        this.loadingText = new PIXI.Text(
            get_localized_text("help_loading") + "..."
        );
        this.loadingText.style = new PIXI.TextStyle({
            align: "center",
            dropShadow: true,
            dropShadowAngle: 120.1,
            dropShadowBlur: 1,
            dropShadowDistance: 4,
            fill: ["#ffed24"],
            fontFamily: "Calibri Bold",
            fontSize: 45,
            miterLimit: 0,
            stroke: "white",
            wordWrapWidth: 0,
        });
        this.loadingText.anchor.set(0, 0.5);
        this.loadingText.visible = false;
        this.loadingText.position.set(
            1440 / 2 - this.loadingText.width / 2,
            410
        );
        this.landscape_container.addChild(this.loadingText);
    };

    createMask = () => {
        this.mask = new PIXI.Sprite(
            PIXI.Loader.shared.resources["shadow"].texture
        );
        this.mask.zIndex = -1;
        this.mask.interactive = true;
        this.mask.on("pointerdown", this.clear);
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

    createArrowButtons = () => {
        const left_right_y = 725;
        const left_right_offset = 100;
        const center_x = 720;

        this.spinsText = new PIXI.Text(
            get_localized_text("helpmenu_spins"),
            TextStyles.help_page_numbers
        );
        this.spinsText.position.set(center_x, left_right_y);
        this.spinsText.anchor.set(0.5);
        this.landscape_container.addChild(this.spinsText);

        this.leftHistory = new Button(ASSETS["left_button.png"], true);
        this.leftHistory.hover_texture = ASSETS["left_button_over.png"];
        this.leftHistory.sprite.position.set(
            center_x - left_right_offset,
            left_right_y
        );
        this.leftHistory.callback = () => this.setPage(-1);
        this.landscape_container.addChild(this.leftHistory.sprite);

        this.rightHistory = new Button(ASSETS["Right_button.png"], true);
        this.rightHistory.hover_texture = ASSETS["Right_button_over.png"];
        this.rightHistory.sprite.position.set(
            center_x + left_right_offset,
            left_right_y
        );
        this.rightHistory.callback = () => this.setPage(1);
        this.landscape_container.addChild(this.rightHistory.sprite);
    };

    loadHistory = async () => {
        // Bonus pages are fake pages that are used to show the bonus game
        const pages = this.visiblePage - this.bonusPages;
        const list = Math.floor(pages / this.maxPages) + 1;

        this.no_history!.visible = false;
        this.loadingText!.visible = true;

        const history = await get_history(list, this.maxPages);
        this.loadingText!.visible = false;

        if (history.spins_history.length) {
            this.no_history!.visible = false;

            for (const spin_history of history.spins_history) {
                for (const spin of spin_history.reels.spins) {
                    const bonus_stages_win = spin.stages.reduce(
                        (acc, stage) =>
                            // prettier-ignore
                            acc + (stage.bonus_game ? stage.bonus_game.spins.reduce( (acc, spin) => acc + spin.amount, 0 ) : 0),
                        0
                    );

                    const award_for_current_spin =
                        spin_history.base_pay - bonus_stages_win;
                    const balance_after_spin =
                        spin_history.final_balance - bonus_stages_win;

                    spin_history.base_pay = award_for_current_spin;
                    spin_history.final_balance = balance_after_spin;

                    const HistorySM = new newHSM(this.app, spin_history);
                    HistorySM.container.visible = false;
                    this.landscape_container.addChild(HistorySM.container);

                    let bonus_start_balance = balance_after_spin;

                    const bonus_sms: newHSM[] = [];
                    spin.stages.forEach((stage) => {
                        for (const bonusSpin of stage.bonus_game?.spins || []) {
                            const bonus_spin = Object.assign(
                                {},
                                bonusSpin,
                                spin_history
                            );
                            bonus_spin.balance = bonus_start_balance;
                            bonus_start_balance += bonusSpin.amount;
                            bonus_spin.final_balance = bonus_start_balance;

                            bonus_spin.reels.spins = [bonusSpin];
                            bonus_spin.base_pay = bonusSpin.amount;

                            const bonusSM = new newHSM(
                                this.app,
                                bonus_spin,
                                true
                            );
                            bonusSM.container.visible = false;
                            this.landscape_container.addChild(
                                bonusSM.container
                            );

                            bonus_sms.push(bonusSM);
                        }
                    });

                    this.bonusPages += bonus_sms.length;

                    this.arrayOfSM.push(...bonus_sms.reverse());
                    this.arrayOfSM.push(HistorySM);
                }
            }
        }

        this.totalPages = history.total - 1;

        if (this.totalPages < 0) {
            this.no_history!.visible = true;
        }
    };

    createTopButtons = () => {
        this.history_button = new Button(ASSETS["history_active.png"], true);
        this.history_button.hover_texture = ASSETS["history_active.png"];
        this.history_button.sprite.position.set(1020, 80);
        // this.history_button.event = EVENTS.open_settings;
        this.landscape_container.addChild(this.history_button.sprite);

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

        this.sound_button = new Button(ASSETS["sound_inactive.png"], true);
        this.sound_button.hover_texture = ASSETS["sound_inactive.png"];
        this.sound_button.sprite.position.set(870, 80);
        this.sound_button.event = EVENTS.open_settings;
        this.landscape_container.addChild(this.sound_button.sprite);

        this.close_button = new Button(ASSETS["Exit_button.png"], true);
        this.close_button.hover_texture = ASSETS["Exit_button.png"];
        this.close_button.sprite.position.set(1077, 51);
        this.close_button.event = EVENTS.close_history;
        this.landscape_container.addChild(this.close_button.sprite);
    };

    addArrow = () => {
        const arrow = new PIXI.Sprite(ASSETS["arrow.png"]);
        arrow.anchor.set(0.5);
        arrow.position.set(1020, 126);
        this.landscape_container.addChild(arrow);
    };

    addHeader = () => {
        const sound = new PIXI.Text(
            get_localized_text("helpmenu_history"),
            TextStyles.menu_title
        );
        sound.anchor.set(0.5);
        sound.position.set(720, 167);
        this.landscape_container.addChild(sound);
    };

    show_hide_info = (shouldShow = true) => {
        if (shouldShow) {
            this.header!.visible = true;

            this.leftHistory!.sprite.visible = true;
            this.rightHistory!.sprite.visible = true;

            this.setLeftButtonState(true);
            this.setRightButtonState(true);

            return;
        }

        this.no_history!.visible = true;

        this.header!.visible = false;

        this.setLeftButtonState(false);
        this.setRightButtonState(false);

        this.leftHistory!.sprite.visible = false;
        this.rightHistory!.sprite.visible = false;
    };

    createTransaction = () => {
        this.header = new PIXI.Text(
            get_localized_text("helpmenu_history_1"),
            TextStyles.settings_history_header
        );
        this.header.anchor.set(0, 0.5);
        this.header.position.set(375, 580);
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

    private setPage = async (value: number) => {
        this.arrayOfSM[this.visiblePage].container.visible = false;

        this.visiblePage += value;

        this.setLeftButtonState(true);
        this.setRightButtonState(true);

        if (this.visiblePage <= 0) {
            this.visiblePage = 0;
            this.setLeftButtonState(false);
        }

        if (this.visiblePage >= this.totalPages + this.bonusPages) {
            this.visiblePage = this.totalPages + this.bonusPages;
            this.setRightButtonState(false);
        }

        if (!this.arrayOfSM[this.visiblePage]) {
            await this.loadHistory();
        }

        this.arrayOfSM[this.visiblePage].container.visible = true;
    };

    private setLeftButtonState = (value: boolean) => {
        const alpha = value ? 1 : 0.3;

        this.leftHistory!.sprite.interactive = value;
        this.leftHistory!.sprite.alpha = alpha;
    };

    private setRightButtonState = (value: boolean) => {
        const alpha = value ? 1 : 0.3;

        this.rightHistory!.sprite.interactive = value;
        this.rightHistory!.sprite.alpha = alpha;
    };
}
