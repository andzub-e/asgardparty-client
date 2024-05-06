export interface sliderEventDetail {
    toggled: boolean;
}

export class Slider {
    bg: PIXI.Sprite;
    fg: PIXI.Sprite;
    fg_mask = new PIXI.Graphics();
    head: PIXI.Sprite;

    head_normal: PIXI.Texture;
    head_hovered?: PIXI.Texture;
    head_pressed?: PIXI.Texture;
    head_disabled?: PIXI.Texture;

    values: number[];
    event_type: string;

    value = 0;

    is_dragged = false;
    is_hovered = false;

    constructor(
        bg: PIXI.Texture,
        fg: PIXI.Texture,
        head: PIXI.Texture,
        values: number[],
        event_type: string
    ) {
        this.bg = new PIXI.Sprite(bg);
        this.bg.anchor.set(0, 0.5);
        this.bg.interactive = true;
        this.bg.cursor = "pointer";
        this.bg.on("pointerdown", this.clicked);

        this.event_type = event_type;
        this.values = values;

        this.fg = new PIXI.Sprite(fg);
        this.fg.anchor.set(0, 0.5);
        this.bg.addChild(this.fg);

        this.fg_mask.beginFill(0x000000);
        this.fg_mask.drawRect(
            0,
            this.bg.height / 2,
            this.bg.width,
            this.bg.height
        );
        this.fg_mask.endFill();
        this.bg.addChild(this.fg_mask);
        this.fg.mask = this.fg_mask;

        this.head = new PIXI.Sprite(head);
        this.head.position.set(this.head.width / 2, 0);
        this.head.anchor.set(0.5, 0.5);
        this.bg.addChild(this.head);
        this.head.interactive = true;
        this.head.cursor = "pointer";
        this.head.on("pointerdown", this.set_dragged);
        this.head.on("pointerup", this.unset_dragged);
        this.head.on("pointerupoutside", this.unset_dragged);
        this.head.on("pointermove", this.dragged);
        this.head.on("pointerover", this.hovered);
        this.head.on("pointerout", this.unhovered);

        this.head_normal = head;
    }

    set_dragged = () => {
        this.is_dragged = true;
        this.pressed();
    };

    unset_dragged = () => {
        this.is_dragged = false;
        this.unpressed();
    };

    drag = () => {};

    clicked = (e: PIXI.InteractionEvent) => {
        const local_x = e.data.global.x - this.bg.worldTransform.tx;
        this.calculate_value_index(local_x);
    };

    dragged = (e: PIXI.InteractionEvent) => {
        if (this.is_dragged) {
            const local_x = e.data.global.x - this.bg.worldTransform.tx;
            this.calculate_value_index(local_x);
        }
    };

    calculate_value_index = (_x: number) => {
        const x = _x;

        let index = 0;

        const width = this.bg.width - this.head.width;
        /* const width = (this.bg.width / this.bg.localTransform.a) *
        this.bg.worldTransform.a; */
        const section_width = width / (this.values.length - 1);

        if (x <= 0) {
            index = 0;
        } else if (x >= width) {
            index = this.values.length - 1;
        } else {
            for (let i = 0; i < this.values.length; i++) {
                if (x < this.head.width / 2 + (i + 1) * section_width) {
                    if (x < this.head.width / 2 + (i + 0.5) * section_width) {
                        index = i;
                    } else {
                        index = i + 1;
                    }
                    break;
                }
            }
        }

        index = Math.min(this.values.length - 1, index);

        this.set_value_index(index);
    };

    set_value_index = (index: number) => {
        this.value = this.values[index];
        document.dispatchEvent(
            new CustomEvent<number>(this.event_type, {
                detail: this.value,
            })
        );

        this.update_graphics(index);
    };

    update_graphics(index: number) {
        //@TODO NOW COUNTS ONLY HOVERED TEXTURE!!!!
        if (index === 0 && !this.is_dragged && !this.is_hovered) {
            this.head.texture = this.head_normal;
        } else {
            this.head.texture = this.head_hovered!;
        }

        const width = this.bg.width - this.head.width;
        // const scaled_width = width / this.bg.localTransform.a;
        const section_width = width / (this.values.length - 1);

        const height = this.bg.height;

        const new_width = index * section_width;

        this.fg_mask.clear();
        this.fg_mask.beginFill(0x000000);
        this.fg_mask.drawRect(
            0,
            -height / 2,
            new_width + this.head.width / 2,
            height
        );
        this.fg_mask.endFill();

        this.head.x = new_width + this.head.width / 2;
    }

    hovered = () => {
        this.is_hovered = true;

        if (this.head_hovered && !this.is_dragged) {
            this.head.texture = this.head_hovered;
        }
    };

    unhovered = () => {
        this.is_hovered = false;

        if (!this.is_dragged && this.value === 0) {
            this.head.texture = this.head_normal;
        }
    };

    pressed = () => {
        if (this.head_pressed) {
            this.head.texture = this.head_pressed;
        }
    };

    unpressed = () => {
        if (this.is_hovered) {
            if (this.head_hovered) {
                this.head.texture = this.head_hovered;
            }
        } else if (this.value === 0) {
            this.head.texture = this.head_normal;
        }
    };
}
