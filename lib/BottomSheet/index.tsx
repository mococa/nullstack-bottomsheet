import Nullstack, { NullstackClientContext } from "nullstack";
import "./styles.scss";

const closest = (arr: number[], value: number) =>
  arr.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );

interface NullstackRef {
  property?: string | number;
  object?: any;
}

export interface BottomSheetProps {
  ref?: BottomSheet;
  snaps: number[];
  default_snap: number;
  onclose: () => void;
  id?: string;
  snapping_time?: number;
  close_on_snap_to_zero?: boolean;
  lock_scroll?: boolean;
  onsnap?: (snap: number) => void;
  class?: string | string[];
}

export class BottomSheet extends Nullstack<BottomSheetProps> {
  drag_position?: number;
  sheet_height: number;
  sheet_shown: boolean;
  private sheet_content: HTMLDivElement;
  private draggable_area: HTMLDivElement;
  private overlay: HTMLDivElement;

  private _touch_position(event: any) {
    return event.touches ? event.touches[0] : event;
  }

  private _replace(url: string) {
    window.history.replaceState(undefined, undefined, url);
  }

  private _push(url: string) {
    window.history.pushState(undefined, undefined, url);
  }

  private dragstart({ event }) {
    this.drag_position = this._touch_position(event).pageY;
    this.draggable_area.style.cursor = document.body.style.cursor = "grabbing";
    this.sheet_content.classList.remove("fullscreen");
  }

  private dragmove({ event }) {
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

  private dragend({
    snaps,
    snapping_time = 200,
    close_on_snap_to_zero,
    onsnap,
  }: Partial<NullstackClientContext<BottomSheetProps>>) {
    this.sheet_content.style.transition = `height 0.5s, max-height ${snapping_time}ms ease`;

    this.draggable_area.style.cursor = document.body.style.cursor = "";

    const closest_value = closest(snaps, this.sheet_height);
    if (onsnap) onsnap(closest_value);

    this.sheet_shown = Boolean(closest_value);
    this.sheet_height = closest_value;
    this.sheet_content.style.maxHeight = `${closest_value}dvh`;

    if (closest_value === 100) {
      this.sheet_content.classList.add("fullscreen");
    } else {
      this.sheet_content.classList.remove("fullscreen");
    }

    if (
      !closest_value &&
      close_on_snap_to_zero &&
      this.drag_position !== undefined
    ) {
      this.close({});
    }

    this.drag_position = undefined;

    setTimeout(() => {
      this.sheet_content.style.removeProperty("transition");
    }, snapping_time);
  }

  private lockScroll({
    lock_scroll = true,
  }: Partial<NullstackClientContext<BottomSheetProps>>) {
    if (document.body.scrollHeight < window.innerHeight) return;
    if (!lock_scroll) return;
    if (document.body.classList.contains("bottom-sheet-body-lock")) return;

    document.body.style.marginTop = `-${window.scrollY}px`;
    document.body.classList.add("bottom-sheet-body-lock");
  }

  private unlockScroll({
    lock_scroll = true,
  }: Partial<NullstackClientContext<BottomSheetProps>>) {
    if (!lock_scroll) return;
    const scrollTop = -parseInt(document.body.style.marginTop, 10);
    document.body.style.removeProperty("margin-top");
    if (!document.body.classList.contains("bottom-sheet-body-lock")) return;
    document.body.classList.remove("bottom-sheet-body-lock");
    window.scrollTo(window.scrollY, scrollTop);
  }

  async close({
    snapping_time = 200,
    onclose,
    lock_scroll = true,
    router,
  }: Partial<NullstackClientContext<BottomSheetProps>>) {
    this.sheet_content.style.transition = `height 0.5s, max-height ${snapping_time}ms ease`;
    this.sheet_content.style.maxHeight = `0dvh`;
    this.overlay.classList.remove("showing");

    this.unlockScroll({ lock_scroll });

    this._replace(router.url);

    await new Promise((res) => {
      setTimeout(res, snapping_time);
    });

    onclose();
  }

  hydrate({
    default_snap,
    snapping_time = 200,
    lock_scroll = true,
    router,
    id,
    ref,
  }: NullstackClientContext<BottomSheetProps>) {
    if (ref) {
      const { object, property } = ref as NullstackRef;
      object[property] = this;
    }

    this.overlay.classList.add("showing");
    this.sheet_content.style.transition = `height 0.5s, max-height ${snapping_time}ms ease`;
    this.sheet_content.style.maxHeight = `${default_snap}dvh`;
    this.sheet_height = default_snap;

    if (id) this._push(`${router.url}#bottom-sheet:${id}`);

    window.addEventListener("pointermove", (event) => this.dragmove({ event }));
    window.addEventListener("hashchange", () => this.close({}));
    window.addEventListener("keyup", ({ key }) => {
      if (key === "Escape") this.close({});
    });

    setTimeout(() => {
      this.sheet_content.style.removeProperty("transition");
    }, snapping_time);

    this.lockScroll({ lock_scroll });
  }

  terminate() {
    window.removeEventListener("pointermove", (event) =>
      this.dragmove({ event })
    );

    window.removeEventListener("hashchange", () => this.close({}));

    window.removeEventListener("keyup", ({ key }) => {
      if (key === "Escape") this.close({});
    });
  }

  render({ children, class: klass }: NullstackClientContext<BottomSheetProps>) {
    return (
      <div
        class={["bottom-sheet", klass].flat().filter(Boolean).join(" ")}
        onpointermove={this.dragmove}
      >
        <div class="overlay" ref={this.overlay} onclick={this.close} />

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
