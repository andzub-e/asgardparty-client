import { clamp } from "./Util";

export class Scroll {
    container: PIXI.Container;
    head: PIXI.Sprite;
    is_dragged: boolean;
    starting_y: number;
    scrollable_container: PIXI.Container;
    visible_height: number;
    offset: number;
    movable_height: number;
    head_offset: number;
    bg: PIXI.Sprite;

    scrollable_container_dragged?: boolean;
    scrollable_container_last_y?: number;

    constructor(
        head_texture: PIXI.Texture,
        bg_texture: PIXI.Texture,
        scrollable_container: PIXI.Container,
        visible_height: number,
        offset = 0,
        touch_scroll = false,
        head_offset = 0
    ) {
        this.is_dragged = false;
        this.starting_y = scrollable_container.y;
        this.scrollable_container = scrollable_container;
        this.visible_height = visible_height;
        this.offset = offset;
        this.head_offset = head_offset;

        this.container = new PIXI.Container();

        this.bg = new PIXI.Sprite(bg_texture);
        this.bg.interactive = true;
        this.bg.on("pointerdown", (e: PIXI.InteractionEvent) => {
            this.move_container(e.data.global.y);
        });
        this.bg.anchor.x = 0.5;
        this.container.addChild(this.bg);

        this.movable_height =
            this.scrollable_container.height -
            this.visible_height +
            this.offset;

        this.head = new PIXI.Sprite(head_texture);
        this.head.anchor.set(0.5, 0.5);
        this.head.y = head_offset;
        this.container.addChild(this.head);
        this.head.interactive = true;
        this.head.on("pointerdown", () => {
            this.is_dragged = true;
        });
        this.head.on("pointerup", () => {
            this.is_dragged = false;
        });
        this.head.on("pointerupoutside", () => {
            this.is_dragged = false;
        });
        this.head.on("pointermove", (e: PIXI.InteractionEvent) => {
            if (this.is_dragged) {
                this.move_container(e.data.global.y);
            }
        });

        if (touch_scroll) {
            this.scrollable_container.interactive = true;
            this.scrollable_container_dragged = false;
            this.scrollable_container_last_y = 0;
            this.scrollable_container.on(
                "pointerdown",
                (e: PIXI.InteractionEvent) => {
                    this.scrollable_container_dragged = true;
                    this.scrollable_container_last_y = e.data.global.y;
                }
            );
            this.scrollable_container.on("pointerup", () => {
                this.scrollable_container_dragged = false;
            });
            this.scrollable_container.on("pointerupoutside", () => {
                this.scrollable_container_dragged = false;
            });
            this.scrollable_container.on(
                "pointermove",
                (e: PIXI.InteractionEvent) => {
                    if (this.scrollable_container_dragged) {
                        const diff =
                            e.data.global.y - this.scrollable_container_last_y!;
                        const new_pos_raw = this.scrollable_container.y + diff;
                        const new_pos = clamp(
                            new_pos_raw,
                            this.starting_y - this.movable_height,
                            this.starting_y
                        );
                        this.scrollable_container.y = new_pos;

                        this.scrollable_container_last_y = e.data.global.y;
                        this.reverse_scroll();
                    }
                }
            );
        }
    }

    move_container = (y: number) => {
        const bg_height = this.get_bg_height();

        const true_y = y - this.container.getGlobalPosition().y;
        const proportion = clamp(true_y / bg_height, 0, 1);
        const target_y = this.starting_y - this.movable_height * proportion;
        this.scrollable_container.y = target_y;
        this.head.y =
            this.head_offset +
            (this.bg.height - this.head_offset * 2) * proportion;
    };

    reverse_scroll = () => {
        const proportion =
            (this.scrollable_container.y - this.starting_y) /
            -this.movable_height;

        this.head.y =
            this.head_offset +
            proportion * (this.bg.height - this.head_offset * 2);
    };

    get_bg_height = () => {
        return (
            this.bg.worldTransform.decompose(new PIXI.Transform()).scale.y *
            this.bg.height
        );
    };
}
