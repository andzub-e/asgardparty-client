import { Slider } from "./Slider";

export class SliderValueDisplay extends Slider {
    private value_display_text: PIXI.Text | undefined;

    constructor(
        bg: PIXI.Texture,
        fg: PIXI.Texture,
        head: PIXI.Texture,
        values: number[],
        event_type: string,
        value_display_text: PIXI.Text
    ) {
        super(bg, fg, head, values, event_type);

        this.value_display_text = value_display_text;

        this.bg.addChild(this.value_display_text);

        document.addEventListener(event_type, this.update_display_value);
    }

    update_graphics(index: number) {
        super.update_graphics(index);

        this.value_display_text!.position.x = this.head.position.x;
    }

    private update_display_value = (evt: Event) => {
        const event = evt as CustomEvent<number>;

        this.value_display_text!.text = event.detail.toString();
    };
}
