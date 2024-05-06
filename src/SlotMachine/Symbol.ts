import { Config } from "../Config";
import { ASSETS } from "../Assets";
import { stop_spine_animation } from "../Util";
import anime from "animejs";
import { TextStyles } from "../TextStyles";
import { LogicState } from "../logic_state";
import { ECL } from "ecl";
import { InteractionEvent } from "pixi.js";
import { get_localized_text } from "../linguist";

interface Position {
    x: number;
    y: number;
}

// const debug_style = new PIXI.TextStyle({
//     dropShadowColor: "#87340b",
//     dropShadowDistance: 1,
//     fill: "white",
//     fontSize: 38,
//     fontVariant: "small-caps",
//     letterSpacing: -2,
//     lineJoin: "round",
//     padding: 7,
//     strokeThickness: 5,
// });

export class rSymbol {
    app: PIXI.Application;
    symbol_type: number;

    container: PIXI.Container;
    offsetContainer: PIXI.Container;

    main_sprite: PIXI.Sprite;
    main_texture: PIXI.Texture;
    inactive_texture: PIXI.Texture;
    animation?: PIXI.spine.Spine | null;

    win_box_animation?: PIXI.spine.Spine;

    win_info_bg?: PIXI.Sprite;
    info_container?: PIXI.Container;

    in_use = false;
    pop_up = false;

    // debug_text = new PIXI.Text("", debug_style);
    constructor(app: PIXI.Application, symbol_type: number) {
        this.app = app;
        this.symbol_type = symbol_type;

        this.container = new PIXI.Container();

        this.main_texture = ASSETS[Config.main_textures_keys[symbol_type]];
        this.inactive_texture =
            ASSETS[Config.inactive_textures_keys[symbol_type]];

        this.main_sprite = new PIXI.Sprite(this.main_texture);
        this.main_sprite.interactive = true;
        this.main_sprite.buttonMode = true;
        this.main_sprite.anchor.set(0.5, 0.5);
        this.offsetContainer = new PIXI.Container();
        this.offsetContainer.addChild(this.main_sprite);

        this.container.addChild(this.offsetContainer);
        this.container.visible = false;

        const offset = Config.symbols_offsets[symbol_type];

        this.offsetContainer.position.x = offset.x;
        this.offsetContainer.position.y = offset.y;

        this.replace_animation();

        this.main_sprite.on("pointerdown", (e: InteractionEvent) => {
            if (this.pop_up) {
                this.hide_all_pop_up();
                return;
            }
            if (LogicState.sm_state === "idle") {
                this.hide_all_pop_up();
                if (!this.pop_up) {
                    const position = { x: e.data.global.x, y: e.data.global.y };
                    this.createSideInfo(position);
                    this.darken();
                } else {
                    this.pop_up_hide();
                }
            }
        });

        // this.debug_text.anchor.set(0.5, 0.5);
        // this.main_sprite.addChild(this.debug_text);
    }

    hide_all_pop_up = () => {
        LogicState.reels_target_symbols.forEach((reel) =>
            reel.target_symbols.forEach((symbol) => symbol.pop_up_hide())
        );
        LogicState.top_reels_target_symbols!.target_symbols.forEach((symbol) =>
            symbol.pop_up_hide()
        );
    };

    pop_up_hide = () => {
        this.app.stage.removeChild(this.info_container!);
        this.brighten();
        this.pop_up = false;
    };

    getPopupText = (num: number) => {
        if (num === 0) {
            return get_localized_text("popup_1");
        } else if (num === 1) {
            return get_localized_text("popup_2");
        } else {
            return get_localized_text("popup_3");
        }
    };

    createSideInfo = (position: Position) => {
        this.info_container = new PIXI.Container();
        this.app.stage.addChild(this.info_container);
        this.pop_up = true;

        this.win_info_bg = new PIXI.Sprite(
            PIXI.Loader.shared.resources["popUp"].texture
        );
        this.win_info_bg.zIndex = 1;
        this.win_info_bg.scale.set(0.8);

        const bounds = this.container.getBounds();

        if (this.symbol_type > 2 && this.symbol_type < 14) {
            this.win_info_bg.position.set(position.x, position.y);
        } else {
            this.win_info_bg.position.set(
                bounds.x + bounds.width / 2,
                bounds.y + bounds.height / 2
            );
        }

        this.win_info_bg.anchor.set(1, 0.5);
        this.info_container.addChild(this.win_info_bg);

        let info = "";
        let win = "";
        let info_text;

        const infoArray: number[] | string =
            Config.symbolsWins[
                this.symbol_type as keyof typeof Config.symbolsWins
            ];

        if (this.symbol_type < 5) {
            info = this.getPopupText(this.symbol_type);
            info_text = new PIXI.Text(`${info}`, TextStyles.popUpText);
        } else {
            info = "4x-\n5x-\n6x-\n7x-";
            const bet_multiplier = LogicState.getBet() / 100;
            win = `${ECL.fmt.money(
                bet_multiplier * (infoArray[0] as number)
            )}\n${ECL.fmt.money(
                bet_multiplier * (infoArray[1] as number)
            )}\n${ECL.fmt.money(
                bet_multiplier * (infoArray[2] as number)
            )}\n${ECL.fmt.money(bet_multiplier * (infoArray[3] as number))}`;

            info_text = new PIXI.Text(`${info}`, TextStyles.popUp);
        }

        const win_text = new PIXI.Text(`${win}`, TextStyles.popUp);

        info_text.anchor.set(1, 0.5);

        if (this.symbol_type > 5) {
            info_text.position.set(-174, 0);
            win_text.position.set(-170, 0);
        } else {
            info_text.anchor.set(0, 0.5);
            info_text.position.set(-210, 0);
        }

        info_text.zIndex = 2;

        win_text.anchor.set(0, 0.5);
        win_text.zIndex = 2;

        this.win_info_bg.addChild(win_text, info_text);
    };

    replace_animation = () => {
        const anim_key = Config.symbol_animations_keys[this.symbol_type];
        const asset =
            Config.symbol_animations_keys[this.symbol_type].asset_name;

        this.animation = new PIXI.spine.Spine(
            PIXI.Loader.shared.resources[asset].spineData
        );

        this.animation.scale.set(anim_key.scale);
        const bounds = this.offsetContainer.getBounds();

        if (this.symbol_type < 2) {
            this.animation.position.set(bounds.x / 2 + 28, bounds.y / 2 + 28);
        } else if (this.symbol_type > 1 && this.symbol_type < 4) {
            this.animation.position.set(-bounds.x / 2 - 80, -bounds.y / 2 - 83);
        } else if (this.symbol_type > 3 && this.symbol_type < 6) {
            this.animation.position.set(-bounds.x / 2 - 80, -bounds.y / 2 - 90);
        } else if (this.symbol_type === 6) {
            this.animation.position.set(-bounds.x / 2 - 85, -bounds.y / 2 - 90);
        } else if (this.symbol_type === 7) {
            this.animation.position.set(-bounds.x / 2 - 78, -bounds.y / 2 - 63);
        } else if (this.symbol_type > 9 && this.symbol_type < 16) {
            this.animation.position.set(-bounds.x / 2 - 77, -bounds.y / 2 - 79);
        } else {
            this.animation.position.set(-bounds.x / 2 - 80, -bounds.y / 2 - 85);
        }

        this.animation.visible = false;
        this.container.addChild(this.animation);
    };

    destroy = () => {
        return new Promise<void>((resolve) => {
            this.container.alpha = 1;
            anime({
                duration: 1000,
                targets: this.container,
                alpha: [1, 0],
                complete: () => {
                    this.cleanup();
                    resolve();
                },
            });
        });
    };

    /**
     * Сброс текстуры, видимость, альфа
     */
    cleanup = () => {
        this.in_use = false;
        this.main_sprite!.texture = this.main_texture;
        this.container.visible = false;
        this.container.alpha = 1;
    };

    darken = () => {
        this.main_sprite!.texture = this.inactive_texture;

        this.main_sprite.tint = 0x4e4e4e;
        this.stop_anim();
    };

    brighten = () => {
        this.stop_anim();
        this.main_sprite!.texture = this.main_texture;

        this.main_sprite.tint = 0xffffff;
    };

    play_anim = (onCompleteCallback?: () => void) => {
        if (this.animation !== null) {
            this.animation!.state.setAnimation(
                0,
                Config.symbol_animations_keys[this.symbol_type]!.animation_name,
                false
            );
            this.animation!.visible = true;
            this.main_sprite.visible = false;
            this.animation!.state.onComplete = () => {
                if (onCompleteCallback) onCompleteCallback();
            };
        } else {
            if (onCompleteCallback) onCompleteCallback();
        }
    };

    stop_anim = () => {
        if (this.animation !== null) {
            stop_spine_animation(this.animation, 0, false);
            this.main_sprite.visible = true;
        }
    };

    use = () => {
        this.in_use = true;
        this.container.visible = true;

        this.brighten();
    };

    fadeout = (onComplete?: () => void) => {
        if (!this.animation) return onComplete && onComplete();
        this.container.alpha = 1;
        anime({
            targets: this.container,
            alpha: 0,
            duration: 500,
            easing: "easeOutCubic",
            complete: () => {
                this.cleanup();
                if (onComplete) onComplete();
            },
        });
    };

    fadein = (onComplete?: () => void) => {
        if (!this.animation) return onComplete && onComplete();
        this.container.alpha = 0;
        anime({
            targets: this.container,
            alpha: 1,
            duration: 500,
            easing: "easeInCubic",
            complete: () => {
                this.use();
                if (onComplete) onComplete();
            },
        });
    };
}
