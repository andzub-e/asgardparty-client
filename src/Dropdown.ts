import { Scroll } from "./Scroll";
export interface DropdownEventDetail {
    index: number;
}

export class Dropdown {
    container: PIXI.Container;
    options_container: PIXI.Sprite;
    selected_index: number;
    selected_text: PIXI.Text;
    selected_temp: number | null;
    event_name: string;

    constructor(
        app: PIXI.Application,
        options: string[],
        main_texture: PIXI.Texture,
        list_texture: PIXI.Texture,
        main_style: PIXI.TextStyle,
        list_style: PIXI.TextStyle,
        option_height: number,
        scroll_bg_texture: PIXI.Texture,
        scroll_head_texture: PIXI.Texture,
        event_name: string
    ) {
        this.event_name = event_name;
        this.selected_index = 0;
        this.selected_temp = null;

        this.container = new PIXI.Container();
        this.container.interactive = true;

        this.options_container = new PIXI.Sprite(list_texture);
        const options_content = new PIXI.Container();
        const options_panel_height = this.options_container.height;

        const main_sprite = new PIXI.Sprite(main_texture);
        main_sprite.anchor.x = 0.5;
        this.container.addChild(main_sprite);
        main_sprite.interactive = true;
        main_sprite.on("pointerdown", this.open);

        this.selected_text = new PIXI.Text(options[0], main_style);
        this.selected_text.anchor.set(0.5, 0.5);
        this.selected_text.y = main_sprite.height / 2;
        main_sprite.addChild(this.selected_text);

        this.options_container.anchor.x = 0.5;
        this.options_container.visible = false;
        this.options_container.interactive = true;

        const options_mask = new PIXI.Graphics();
        options_mask.beginFill(0x000000);
        options_mask.drawRect(
            0,
            0,
            this.options_container.width,
            this.options_container.height
        );
        options_mask.endFill();
        options_mask.x = -this.options_container.width / 2;
        this.options_container.addChild(options_mask);
        this.options_container.mask = options_mask;

        this.options_container.addChild(options_content);

        options.map((o, i) => {
            const option = new PIXI.Text(o, list_style);
            option.anchor.set(0.5, 0.5);
            option.y = i * option_height + option_height / 2;
            options_content.addChild(option);
            option.interactive = true;
            option.cursor = "pointer";
            option.hitArea = new PIXI.Rectangle(
                -this.options_container.width / 2,
                -option_height / 2,
                this.options_container.width,
                option_height
            );
            option.on("pointerdown", () => {
                this.selected_temp = i;
            });
            option.on("pointerdown", () => {
                this.selected_temp = i;
            });
            option.on("pointerout", () => {
                if (this.selected_temp === i) {
                    this.selected_temp = null;
                }
            });
            option.on("pointermove", () => {
                this.selected_temp = null;
            });
            option.on("pointerup", () => {
                if (this.selected_temp === i) {
                    this.selected_temp = null;
                    this.selected_index = i;
                    this.selected_text.text = o;
                    this.close();
                    document.dispatchEvent(
                        new CustomEvent<DropdownEventDetail>(this.event_name, {
                            detail: {
                                index: this.selected_index,
                            },
                        })
                    );
                }
            });
        });

        if (options_content.height > options_panel_height) {
            const scroll = new Scroll(
                scroll_head_texture,
                scroll_bg_texture,
                options_content,
                options_panel_height,
                option_height / 2,
                true,
                117
            );
            this.options_container.addChild(scroll.container);
            scroll.container.x = this.options_container.width / 2;
        }
    }

    close = () => {
        this.options_container.visible = false;
    };

    open = () => {
        this.options_container.visible = true;
    };
}
