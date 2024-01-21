import Nullstack, { NullstackClientContext } from "nullstack";
import "./styles.scss";

const closest = (arr: number[], value: number) =>
  arr.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );

export interface BottomSheetProps {
  snaps: number[];
  default_snap: number;
  onclose: () => void;
  snapping_time?: number;
  close_on_snap_to_zero?: boolean;
}

export class BottomSheet extends Nullstack<BottomSheetProps> {
  drag_position?: number;
  sheet_content: HTMLDivElement;
  draggable_area: HTMLDivElement;
  overlay: HTMLDivElement;
  sheet_height: number;
  sheet_shown: boolean;

  _touch_position(event: any) {
    return event.touches ? event.touches[0] : event;
  }

  dragstart({ event }) {
    this.drag_position = this._touch_position(event).pageY;
    this.draggable_area.style.cursor = document.body.style.cursor = "grabbing";
    this.sheet_content.classList.remove("fullscreen");
  }

  dragmove({ event }) {
    if (this.sheet_height !== 100)
      this.sheet_content.classList.remove("fullscreen");

    if (this.drag_position === undefined) return;

    const y = this._touch_position(event).pageY;
    const deltaY = this.drag_position - y;
    const deltaHeight = (deltaY / window.innerHeight) * 100;
    this.sheet_height = Math.max(
      0,
      Math.min(100, this.sheet_height + deltaHeight)
    );
    this.sheet_content.style.maxHeight = `${this.sheet_height}dvh`;
    this.drag_position = y;

    if (this.sheet_height === 100)
      this.sheet_content.classList.add("fullscreen");
  }

  dragend({
    snaps,
    snapping_time = 200,
    close_on_snap_to_zero,
  }: Partial<NullstackClientContext<BottomSheetProps>>) {
    this.sheet_content.style.transition = `height 0.5s, max-height ${snapping_time}ms ease`;

    this.draggable_area.style.cursor = document.body.style.cursor = "";

    const closest_value = closest(snaps, this.sheet_height);

    this.sheet_shown = Boolean(closest_value);
    this.sheet_height = closest_value;
    this.sheet_content.style.maxHeight = `${closest_value}dvh`;

    if (closest_value === 100) {
      this.sheet_content.classList.add("fullscreen");
    }

    if (
      !this.sheet_shown &&
      close_on_snap_to_zero &&
      this.drag_position !== undefined
    ) {
      this.onclose({});
    }

    this.drag_position = undefined;

    setTimeout(() => {
      this.sheet_content.style.removeProperty("transition");
    }, snapping_time);
  }

  onclose({
    snapping_time = 200,
    onclose,
  }: Partial<NullstackClientContext<BottomSheetProps>>) {
    this.sheet_content.style.transition = `height 0.5s, max-height ${snapping_time}ms ease`;
    this.sheet_content.style.maxHeight = `0dvh`;
    this.overlay.classList.remove("showing");

    setTimeout(onclose, snapping_time);
  }

  hydrate({
    default_snap,
    snapping_time = 200,
  }: NullstackClientContext<BottomSheetProps>) {
    console.log("hydrating!!!", this.drag_position);
    this.overlay.classList.add("showing");
    this.sheet_content.style.transition = `height 0.5s, max-height ${snapping_time}ms ease`;
    this.sheet_content.style.maxHeight = `${default_snap}dvh`;
    this.sheet_height = default_snap;

    window.addEventListener("pointermove", (event) => this.dragmove({ event }));

    setTimeout(() => {
      this.sheet_content.style.removeProperty("transition");
    }, snapping_time);
  }

  terminate() {
    window.removeEventListener("pointermove", (event) =>
      this.dragmove({ event })
    );
  }

  render({ children }: NullstackClientContext) {
    return (
      <div class="bottom-sheet" onpointermove={this.dragmove}>
        <div class="overlay" ref={this.overlay} onclick={this.onclose} />

        <div class="bottom-sheet-content" ref={this.sheet_content}>
          <header
            ref={this.draggable_area}
            onpointerdown={this.dragstart}
            onpointerup={this.dragend}
          >
            <div class="handler" />
          </header>

          {children}
        </div>
      </div>
    );
  }
}
