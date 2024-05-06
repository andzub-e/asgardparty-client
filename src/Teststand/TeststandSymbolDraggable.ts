import { TeststandSymbol } from "./TeststandSymbol";

export class TeststandSymbolDraggable extends TeststandSymbol {
    private static overlayCanBePlacedColor = "rgba(0,255,0, 0.5)";
    private static overlayCanNotBePlacedColor = "rgba(255,0,0, 0.5)";

    private dragging = false;
    private draggingElement: HTMLElement;
    private overlay: HTMLDivElement;

    private _canBePlaced = false;

    public snapDraggingPosition: { x: number; y: number } | null = null;

    constructor(index: number, draggingCopy = true) {
        super(index);
        // debugger;
        this.draggingElement = this;

        const overlay = (this.overlay = document.createElement("div"));

        overlay.style.backgroundColor = "rgba(0,255,0, 0)";
        overlay.style.position = "absolute";
        overlay.style.width = this.style.width;
        overlay.style.height = this.style.height;

        const offset = {
            x: 0,
            y: 0,
        };

        if (draggingCopy) {
            const draggingElement = (this.draggingElement = new TeststandSymbol(
                this.index
            ));

            this.appendChild(draggingElement);
        }

        const { draggingElement } = this;

        draggingElement.appendChild(overlay);

        this.addEventListener("pointerdown", (e: PointerEvent) => {
            offset.x = e.x - this.offsetLeft;
            offset.y = e.y - this.offsetTop;

            draggingElement.style.opacity = "0.5";

            draggingElement.style.left = `${e.x - offset.x}px`;
            draggingElement.style.top = `${e.y - offset.y}px`;

            this.dragging = true;

            draggingElement.style.position = "absolute";
        });

        document.addEventListener("pointermove", (e: PointerEvent) => {
            e.preventDefault();

            if (!this.dragging) {
                return;
            }

            if (!this.snapDraggingPosition) {
                draggingElement.style.left = `${e.x - offset.x}px`;
                draggingElement.style.top = `${e.y - offset.y}px`;
            } else {
                draggingElement.style.left = `${this.snapDraggingPosition.x}px`;
                draggingElement.style.top = `${this.snapDraggingPosition.y}px`;
            }

            this.dispatchEvent(
                new CustomEvent<{ x: number; y: number }>("dragging", {
                    detail: { x: e.x - offset.x, y: e.y - offset.y },
                })
            );
        });
    }

    get canBePlaced() {
        return this._canBePlaced;
    }

    set canBePlaced(value: boolean) {
        const { overlay } = this;

        this._canBePlaced = value;

        overlay.style.backgroundColor = value
            ? TeststandSymbolDraggable.overlayCanBePlacedColor
            : TeststandSymbolDraggable.overlayCanNotBePlacedColor;
    }

    public setPosition(x: number, y: number, type: string) {
        const { draggingElement } = this;

        draggingElement.style.top = `${x}px`;
        draggingElement.style.left = `${y}px`;
        draggingElement.style.position = type;
    }

    public onDragEnd() {
        const { draggingElement, overlay } = this;

        this.dragging = false;
        this.snapDraggingPosition = null;
        this._canBePlaced = false;
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0)";
        draggingElement.style.opacity = "1";
    }
}

customElements.define("teststand-symbol-draggable", TeststandSymbolDraggable, {
    extends: "div",
});
