import { ASSETS } from "../Assets";
import { Button } from "../Button";
import { get_localized_text } from "../linguist";
import { LogicState } from "../logic_state";
import { TextStyles } from "../TextStyles";

export class Continue {
    app: PIXI.Application;
    container: PIXI.Container;
    info_container: PIXI.Container;
    dont_show_container = new PIXI.Container();
    bg?: PIXI.Sprite;
    btn?: Button;
    hide_continue_next_time_marked = false;
    bg_grey_tint?: PIXI.Sprite;
    plate?: PIXI.Sprite;

    bonusSpin?: PIXI.Sprite;
    mysteryImg?: PIXI.Sprite;
    tryplet?: PIXI.Sprite;
    left1?: PIXI.Sprite;
    left2?: PIXI.Sprite;
    left3?: PIXI.Sprite;
    rightimage?: PIXI.Sprite;
    leftimage?: PIXI.Sprite;
    dot1?: PIXI.Sprite;
    dot2?: PIXI.Sprite;

    titleText?: PIXI.Text;
    titleSymbol?: PIXI.Text;
    titleMult?: PIXI.Text;
    luckyTriplet?: PIXI.Text;
    bonusText?: PIXI.Text;
    mysteryText?: PIXI.Text;
    luckyText?: PIXI.Text;
    fromAbove?: PIXI.Text;
    rightText1?: PIXI.Text;
    rightText2?: PIXI.Text;
    rightText3?: PIXI.Text;
    textNumber?: PIXI.Text;
    DontShow?: PIXI.Text;

    square_v?: PIXI.Sprite;
    v?: PIXI.Sprite;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.info_container = new PIXI.Container();

        this.draw();
        this.drawImg();
        this.drawText();
        this.drawSquare();

        window.addEventListener("resize", this.on_resize);
        window.addEventListener("orientationchange", this.on_resize);

        this.on_resize();
    }

    draw = () => {
        this.bg = new PIXI.Sprite(PIXI.Loader.shared.resources["bg"].texture);
        this.bg.anchor.set(0.5);
        this.bg.position.set(
            this.app.screen.width / 2,
            this.app.screen.height / 2
        );
        this.container.addChild(this.bg);

        this.bg_grey_tint = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.bg_grey_tint.width = 1440;
        this.bg_grey_tint.height = 810;
        this.bg_grey_tint.alpha = 0.5;
        this.bg_grey_tint.tint = 0x000000;
        this.container.addChild(this.bg_grey_tint);

        this.btn = new Button(ASSETS["Info_button_normal.png"]);
        this.btn.hover_texture = ASSETS["Info_button_over.png"];
        this.btn.pressed_texture = ASSETS["Info_button_pressed.png"];
        this.btn.inactive_texture = ASSETS["Info_button_disabled.png"];

        this.btn.callback = () => {
            if (this.hide_continue_next_time_marked) {
                window.localStorage.setItem("hide_continue", "true");
            }
        };

        this.btn.event = new Event("on_continue");

        const text1 = new PIXI.Text(
            get_localized_text("continue_button"),
            TextStyles.settings_help
        );
        text1.position.y = 3;

        text1.anchor.set(0.5);
        this.btn.sprite.addChild(text1);

        this.container.addChild(this.btn.sprite);

        this.plate = new PIXI.Sprite(ASSETS["ui-plate.png"]);
        this.plate.position.set(
            this.app.renderer.width / 2 - this.plate.width / 2,
            -11
        );
        this.container.addChild(this.plate);

        if (LogicState.is_mobile) {
            this.btn.sprite.position.set(this.app.renderer.width / 2, 1000);
        } else {
            this.btn.sprite.position.set(
                this.app.renderer.width / 2,
                688 + this.btn.sprite.height / 2
            );
        }
    };

    drawImg = () => {
        this.bonusSpin = new PIXI.Sprite(ASSETS["symbol_bonus.png"]);
        this.bonusSpin.position.set(171, 157);

        this.mysteryImg = new PIXI.Sprite(ASSETS["symbol_mystery.png"]);
        this.mysteryImg.position.set(177, 298);

        this.tryplet = new PIXI.Sprite(ASSETS["tryplet.png"]);
        this.tryplet.position.set(255, 453);

        this.left1 = new PIXI.Sprite(ASSETS["left-str.png"]);
        this.left1.position.set(515, 588);

        this.left2 = new PIXI.Sprite(ASSETS["left-str.png"]);
        this.left2.position.set(402, 588);
        this.left3 = new PIXI.Sprite(ASSETS["left-str.png"]);
        this.left3.position.set(289, 588);

        this.leftimage = new PIXI.Sprite(ASSETS["leftimage.png"]);
        this.leftimage.position.set(661, 218);

        this.rightimage = new PIXI.Sprite(ASSETS["rightimage.png"]);
        this.rightimage.position.set(953, 218);

        this.dot1 = new PIXI.Sprite(ASSETS["dot.png"]);
        this.dot1.position.set(668, 471);

        this.dot2 = new PIXI.Sprite(ASSETS["dot.png"]);
        this.dot2.position.set(668, 558);

        this.info_container.addChild(
            this.bonusSpin,
            this.mysteryImg,
            this.tryplet,
            this.left1,
            this.left2,
            this.left3,
            this.leftimage,
            this.rightimage,
            this.dot1,
            this.dot2
        );
    };

    drawText = () => {
        this.titleText = new PIXI.Text(
            get_localized_text("continue_asgard_party"),
            TextStyles.continue_title
        );
        this.titleText.position.set(510, 48);

        this.titleSymbol = new PIXI.Text(
            get_localized_text("continue_special_symbols"),
            TextStyles.continue_title_h2
        );
        this.titleSymbol.anchor.set(0.5, 0);
        this.titleSymbol.position.set(410, 116);

        this.titleMult = new PIXI.Text(
            get_localized_text("continue_winning_bet_lines"),
            TextStyles.continue_title_h2
        );
        this.titleMult.anchor.set(0.5, 0);
        this.titleMult.position.set(950, 117); // LUCKY TRIPLET

        this.luckyTriplet = new PIXI.Text(
            get_localized_text("continue_lucky_triplet"),
            TextStyles.continue_title_h2
        );
        this.luckyTriplet.position.set(315, 420);

        this.bonusText = new PIXI.Text(
            get_localized_text("continue_special_sym_body_1"),
            TextStyles.continue_text
        );
        this.bonusText.position.set(302, 171);

        this.mysteryText = new PIXI.Text(
            get_localized_text("continue_special_sym_body_2"),
            TextStyles.continue_text
        );
        this.mysteryText.position.set(307, 303);

        this.luckyText = new PIXI.Text(
            get_localized_text("continue_lucky_triplet_body"),
            TextStyles.continue_text
        );
        this.luckyText.position.set(179, 625);

        this.fromAbove = new PIXI.Text(
            get_localized_text("continue_from_example"),
            TextStyles.continue_title_h3
        );
        this.fromAbove.position.set(859, 602);

        this.rightText1 = new PIXI.Text(
            get_localized_text("continue_win_bet_lines_body_1"),
            TextStyles.continue_text
        );
        this.rightText1.position.set(662, 167);

        this.rightText2 = new PIXI.Text(
            get_localized_text("continue_win_bet_lines_body_2"),
            TextStyles.continue_text
        );
        this.rightText2.position.set(689, 463);

        this.rightText3 = new PIXI.Text(
            get_localized_text("continue_win_bet_lines_body_3"),
            TextStyles.continue_text
        );
        this.rightText3.position.set(684, 550);

        this.textNumber = new PIXI.Text("4x4x2x2=64", TextStyles.continue_text);
        this.textNumber.position.set(907, 627);

        this.info_container.addChild(
            this.titleText,
            this.titleSymbol,
            this.titleMult,
            this.luckyTriplet,
            this.bonusText,
            this.mysteryText,
            this.luckyText,
            this.rightText1,
            this.rightText2,
            this.rightText3,
            this.fromAbove,
            this.textNumber
        );
    };

    drawSquare = () => {
        this.square_v = new PIXI.Sprite(ASSETS["square_v.png"]);
        this.square_v.position.set(0, -2);
        this.square_v.interactive = true;
        this.square_v.cursor = "pointer";

        this.v = new PIXI.Sprite(ASSETS["v.png"]);
        this.v.position.set(0, -4);
        this.v.visible = this.hide_continue_next_time_marked;

        this.square_v.on("pointerdown", () => {
            this.hide_continue_next_time_marked =
                !this.hide_continue_next_time_marked;
            this.v!.visible = this.hide_continue_next_time_marked;
        });

        this.DontShow = new PIXI.Text(
            get_localized_text("continue_checkbox"),
            TextStyles.continue_text
        );
        this.DontShow.position.set(
            this.square_v.x + this.square_v.width + 20,
            this.square_v.y + 2
        );
        const dsc = this.dont_show_container;
        dsc.addChild(this.square_v, this.v, this.DontShow);
        dsc.position.set(this.app.renderer.width * 0.5 - dsc.width * 0.5, 775);
        this.container.addChild(dsc);

        this.container.addChild(this.info_container);
    };

    on_resize = () => {
        if (LogicState.is_mobile) {
            const appWidth = this.app.screen.width;
            const appHeight = this.app.screen.height;

            this.bg_grey_tint!.width = appWidth;
            this.bg_grey_tint!.height = appHeight;

            this.bg!.anchor.y = 0.5;
            this.bg!.position.set(appWidth / 2, appHeight / 2);

            if (LogicState.is_landscape) {
                this.bg!.scale.set(1);
                this.bg!.texture = PIXI.Loader.shared.resources["bg"].texture;

                this.btn!.sprite.position.set(this.app.renderer.width / 2, 680);

                this.plate!.width = 1240;
                this.plate!.height = 650;
                this.plate!.position.set(110, 0);

                this.info_container.scale.set(0.9);
                this.info_container.position.set(80, 0);
                this.dont_show_container.position.set(
                    appWidth * 0.5 - this.dont_show_container.width * 0.5,
                    722
                );
            } else {
                // this.bg!.position.set(810 / 2, 1440 / 2);

                this.bg!.texture =
                    PIXI.Loader.shared.resources["bg_portrait"].texture;

                this.bg!.scale.set(
                    appWidth / this.bg!.texture.width >
                        appHeight / this.bg!.texture.height
                        ? appWidth / this.bg!.texture.width
                        : appHeight / this.bg!.texture.height
                );
                this.btn!.sprite.position.set(this.app.renderer.width / 2, 950);

                this.plate!.width = 850;
                this.plate!.height = 520;
                this.plate!.position.set(-14, 395);
                this.info_container.scale.set(0.67);
                this.info_container.position.set(-80, 410);
                this.dont_show_container.position.set(
                    appWidth * 0.5 - this.dont_show_container.width * 0.5,
                    995
                );

                [
                    this.plate!,
                    this.info_container,
                    this.btn!.sprite,
                    this.dont_show_container,
                ].forEach((elem) => {
                    elem.position.y += appHeight / 2 - 780;
                });
            }
        }
    };
}
