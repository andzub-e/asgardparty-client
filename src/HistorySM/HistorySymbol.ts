import { Config } from "../Config";
import { ASSETS } from "../Assets";

export class HistorySymbol {
    app: PIXI.Application;
    symbol_type: number;

    container: PIXI.Container;
    offsetContainer: PIXI.Container;

    main_sprite: PIXI.Sprite;
    main_texture: PIXI.Texture;
    inactive_texture: PIXI.Texture;

    in_use = false;

    constructor(app: PIXI.Application, symbol_type: number) {
        this.app = app;
        this.symbol_type = symbol_type;

        this.container = new PIXI.Container();

        this.main_texture = ASSETS[Config.main_textures_keys[symbol_type]];
        this.inactive_texture =
            ASSETS[Config.inactive_textures_keys[symbol_type]];

        this.main_sprite = new PIXI.Sprite(this.main_texture);
        this.main_sprite.anchor.set(0.5, 0.5);
        this.offsetContainer = new PIXI.Container();
        this.offsetContainer.addChild(this.main_sprite);

        this.container.addChild(this.offsetContainer);
        this.container.visible = false;

        const offset = Config.symbols_offsets[symbol_type];

        this.offsetContainer.position.x = offset.x;
        this.offsetContainer.position.y = offset.y;
    }

    cleanup = () => {
        this.in_use = false;
        this.main_sprite!.texture = this.main_texture;
        this.container.visible = false;
        this.container.alpha = 1;
    };

    darken = () => {
        this.main_sprite!.texture = this.inactive_texture;

        this.main_sprite.tint = 0x4e4e4e;
    };

    brighten = () => {
        this.main_sprite!.texture = this.main_texture;

        this.main_sprite.tint = 0xffffff;
    };

    use = () => {
        this.in_use = true;
        this.container.visible = true;

        this.brighten();
    };
}
