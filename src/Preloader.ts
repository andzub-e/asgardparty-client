import { LogicState } from "./logic_state";
import { SessionConfig } from "./SessionConfig";
import { ATLASES, ASSETS } from "./Assets";
import { sleep } from "./Util";
import { Config } from "./Config";

export class Preloader {
    readonly container: PIXI.Container;
    private readonly app: PIXI.Application;
    private bg?: PIXI.Sprite;
    on_game_loaded_event: Event;

    loader_mask = new PIXI.Graphics();
    loader_width = 0;
    loader_height = 0;

    slider_bg?: PIXI.Sprite;
    slider_fg?: PIXI.Sprite;

    private loadingAnim!: PIXI.Graphics;
    logo!: PIXI.Sprite;
    preloader_mask = new PIXI.Graphics();

    constructor(app: PIXI.Application, on_game_loaded_event: Event) {
        this.app = app;
        this.on_game_loaded_event = on_game_loaded_event;
        this.container = new PIXI.Container();
        app.stage.addChild(this.container);
        this.createLoader();
        this.updateState().then(() => this.on_resize());
    }

    updateState = async () => {
        this.createLogo();
        await sleep(2000);
        this.draw_loader();
        this.load_assets();
    };

    createLoader = () => {
        this.preloader_mask.clear();
        this.preloader_mask.beginFill(0x000000);
        this.preloader_mask.drawRect(
            0,
            0,
            Config.game_width,
            Config.game_height
        );
        this.preloader_mask.endFill();

        this.loadingAnim = new PIXI.Graphics()
            .lineStyle(15, 0x005050, 1) //! must be white
            .arc(0, 0, 100, 0, Math.PI);

        this.loadingAnim.position.set(
            this.app.view.width / 2,
            this.app.view.height / 2
        );

        this.container.addChild(this.preloader_mask, this.loadingAnim);

        const rotation = () => {
            if (this.loadingAnim) this.loadingAnim.rotation += 0.1;
        };

        this.app.ticker.add(rotation);

        document.addEventListener(
            "preloader_loaded",
            () => {
                this.app.ticker.remove(rotation);
            },
            {
                once: true,
            }
        );
    };

    createLogo = () => {
        const logoLoad = PIXI.Loader.shared.add(
            "logo_start",
            `${SessionConfig.ASSETS_ADDRESS}/logo_start.png`
        );
        logoLoad.onComplete.add((_loader, resources) => {
            this.logo = new PIXI.Sprite(resources["logo_start"].texture);
            this.logo.position.set(
                this.app.view.width / 2 - this.logo.width / 2,
                this.app.view.height / 2 + 150
            );
            this.container.addChild(this.logo);
        });
    };

    draw_loader = () => {
        this.bg = new PIXI.Sprite(
            PIXI.Loader.shared.resources["bg_loading"].texture
        );
        this.container.addChild(this.bg);

        if (LogicState.is_mobile && !LogicState.is_landscape) {
            this.slider_fg = new PIXI.Sprite(
                PIXI.Loader.shared.resources["m_load_bar_fg"].texture
            );
            this.slider_fg!.position.set(143, 1100);
        } else {
            this.slider_fg = new PIXI.Sprite(
                PIXI.Loader.shared.resources["load_bar_fg"].texture
            );
            this.slider_fg.position.set(537, 690);
        }

        this.container.addChild(this.slider_fg);

        this.loader_width = this.slider_fg.width;
        this.loader_height = this.slider_fg.height;

        this.loader_mask.beginFill(0x000000);
        this.loader_mask.drawRect(0, 0, 0, 0);
        this.loader_mask.endFill();
        this.slider_fg.addChild(this.loader_mask);
        this.slider_fg.mask = this.loader_mask;
    };

    update_mask = (progress: number) => {
        this.loader_mask.clear();
        this.loader_mask.beginFill(0x000000);
        this.loader_mask.drawRect(
            0,
            0,
            this.loader_width * progress,
            this.loader_height
        );
        this.loader_mask.endFill();
    };

    load_assets = () => {
        let result = PIXI.Loader.shared
            .add(
                "last_free_spin",
                `${SessionConfig.ASSETS_ADDRESS}spine/last_free_spin/skeleton.json`
            )
            .add(
                "15_free_spin",
                `${SessionConfig.ASSETS_ADDRESS}spine/you_won_15_free_spin/skeleton.json`
            )
            .add(
                "wild_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/wild_symbol/skeleton.json`
            )
            .add(
                "bonus_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/bonus_symbol/skeleton.json`
            )
            .add(
                "mystery_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/mistery_symbol/skeleton.json`
            )
            .add(
                "hammer_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/high_symbol_N2/skeleton.json`
            )
            .add(
                "сross_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/high_symbol_N1/skeleton.json`
            )
            .add(
                "thor_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/high_symbol_N3/skeleton.json`
            )
            .add(
                "mid1_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/mid_symbol_N1/skeleton.json`
            )
            .add(
                "mid2_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/mid_symbol_N2/skeleton.json`
            )
            .add(
                "low1_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/low_symbol_N1/skeleton.json`
            )
            .add(
                "low2_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/low_symbol_N2/skeleton.json`
            )
            .add(
                "low3_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/low_symbol_N3/skeleton.json`
            )
            .add(
                "low4_symbol",
                `${SessionConfig.ASSETS_ADDRESS}spine/low_symbol_N4/skeleton.json`
            )
            .add(
                "win_highlight_anim",
                `${SessionConfig.ASSETS_ADDRESS}spine/win_highlight/skeleton.json`
            )
            .add(
                "logo_anim",
                `${SessionConfig.ASSETS_ADDRESS}spine/logo/skeleton.json`
            )
            .add(
                "big_win_anim",
                `${SessionConfig.ASSETS_ADDRESS}spine/mega_big_win/skeleton.json`
            )
            .add(
                "light_between_win",
                `${SessionConfig.ASSETS_ADDRESS}spine/SoM/light_between_win/skeleton.json`
            )
            .add(
                "bonus_bg",
                `${SessionConfig.ASSETS_ADDRESS}BG_bonus_level.jpg`
            )
            .add(`${SessionConfig.ASSETS_ADDRESS}bitmap_fonts/big_win/font.xml`)
            .add(
                `${SessionConfig.ASSETS_ADDRESS}bitmap_fonts/multipliers/font.xml`
            )
            .add("bg", `${SessionConfig.ASSETS_ADDRESS}bg.jpg`)
            .add(
                "win_line",
                `${SessionConfig.ASSETS_ADDRESS}spine/SoM/win_line/WinLine_animation.json`
            )
            .add(
                "multiplier",
                `${SessionConfig.ASSETS_ADDRESS}spine/SoM/multiplier_anim/non_46.json`
            )
            .add("bg_menu", `${SessionConfig.ASSETS_ADDRESS}/bg_menu.png`)
            .add("shadow", `${SessionConfig.ASSETS_ADDRESS}/shadow.png`)
            .add("number_shining", `${SessionConfig.ASSETS_ADDRESS}shining.png`)
            .add("popUp", `${SessionConfig.ASSETS_ADDRESS}SymbolPopUpInfo.png`)
            .add(
                "destroy",
                `${SessionConfig.ASSETS_ADDRESS}spine/destroy/skeleton.json`
            );

        for (const atlas of ATLASES) {
            result = result.add(
                atlas,
                `${SessionConfig.ASSETS_ADDRESS}${atlas}.json`
            );
        }

        if (LogicState.is_mobile) {
            result
                .add(
                    "bonus_bg_portrait",
                    `${SessionConfig.ASSETS_ADDRESS}portrait/BG_bonus_level.jpg`
                )
                .add(
                    "bg_portrait",
                    `${SessionConfig.ASSETS_ADDRESS}portrait/bg.jpg`
                )
                .add(
                    "shadow_mobile",
                    `${SessionConfig.ASSETS_ADDRESS}/shadow_mobile.png`
                );
        }

        result.onProgress.add(() => {
            this.update_mask(result.progress / 100);
        });

        result.load(() => {
            for (const atlas of ATLASES) {
                for (const texture of Object.keys(
                    PIXI.Loader.shared.resources[atlas].textures!
                )) {
                    ASSETS[texture] =
                        PIXI.Loader.shared.resources[atlas].textures![texture];
                }
            }
            document.dispatchEvent(this.on_game_loaded_event);
        });
    };

    on_resize = () => {
        if (this.loadingAnim) {
            this.loadingAnim.position.set(
                this.app.view.width / 2,
                this.app.view.height / 2
            );
        }
        if (this.logo) {
            this.logo.position.set(
                this.app.view.width / 2 - this.logo.width / 2,
                this.app.view.height / 2 + 150
            );
        }
        if (LogicState.is_mobile) {
            if (LogicState.is_landscape) {
                this.bg!.texture =
                    PIXI.Loader.shared.resources["bg_loading"].texture;
                this.bg!.anchor.y = 0;
                this.bg!.position.set(0, 0);
                this.slider_fg!.texture =
                    PIXI.Loader.shared.resources["load_bar_fg"].texture;
                this.slider_fg!.position.set(537, 690);
            } else {
                this.bg!.anchor.y = 0.5;
                this.bg!.position.set(0, this.app.screen.height / 2);
                this.bg!.texture =
                    PIXI.Loader.shared.resources["m_bg_portrait"].texture;
                this.slider_fg!.position.set(
                    143,
                    this.app.screen.height / 2 + 380
                );
                this.slider_fg!.texture =
                    PIXI.Loader.shared.resources["m_load_bar_fg"].texture;
            }
        }
    };
}
