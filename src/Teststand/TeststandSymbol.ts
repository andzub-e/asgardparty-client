import { ASSETS } from "../Assets";
import { Config } from "../Config";

export class TeststandSymbol extends HTMLDivElement {
    readonly index: number;
    readonly pointOnMatrix: PIXI.Point = new PIXI.Point(0, 0);

    constructor(index: number) {
        super();

        this.index = index;

        const scale = 0.4;

        const textureName = Config.main_textures_keys[index];

        const frame: PIXI.Rectangle = ASSETS[textureName].frame;

        this.style.backgroundImage = `
        url('${ASSETS[textureName].baseTexture.resource.url}')
        `;

        this.style.backgroundRepeat = "no-repeat";

        this.style.display = "block";
        this.style.width = `${frame.width * scale}px`;
        this.style.height = `${frame.height * scale}px`;
        this.id = index.toString();

        this.style.backgroundPosition = `${-frame.x * scale}px ${
            -frame.y * scale
        }px`;
        this.style.backgroundSize = `${
            ASSETS[textureName].baseTexture.resource.width * scale
        }px ${ASSETS[textureName].baseTexture.resource.height * scale}px`;
    }
}

customElements.define("teststand-symbol", TeststandSymbol, {
    extends: "div",
});
