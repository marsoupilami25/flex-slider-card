import noUiSlider, { API as NoUiSliderAPI, PipsMode } from "nouislider";
import { FlexSliderCardConfigMngr } from "./config/flex-slider-card-config-mngr";
import { css, html, LitElement, unsafeCSS } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { fireEvent } from "custom-card-helpers";
import nouiCss from "nouislider/dist/nouislider.css?inline";
import { stdFlexSliderSliderCardCss } from "./css/std-flex-slider-slider-css";
import { compactFlexSliderSliderCardCss } from "./css/compact-flex-slider-slider-css";
import { FlexSliderCardFormat } from "./config/flex-slider-card-config-type";
import { FlexSliderCardValuesBarMode, FlexSliderCardValuesBarSetModeCallback, FlexSliderCardValuesBarSetValueCallback } from "./flex-slider-card-valuesbar";
import { debuglog, minutesToTime } from "./utils/utils";
import { FlexSliderCardEntityType } from "./utils/entity-management";
import {
  CARD_HEIGHT_BASE,
  INTER_CARD,
  COMPACT_TITLE_HEIGHT,
  COMPACT_VERTICAL_CONTAINER_PADDING,
  PRESS_CONFIRM_DELAY_MS,
  STD_TITLE_HEIGHT,
  STD_VERTICAL_CONTAINER_PADDING,
} from "./type/constants";

// Extension de HTMLElement pour typer noUiSlider
export interface NoUiSliderElement extends HTMLElement {
  noUiSlider: NoUiSliderAPI;
}

@customElement("flex-slider-card-slider")
export class FlexSliderCardSlider extends LitElement {

  /****************************************************/
  /* private parameters                               */
  /****************************************************/

  @property({ attribute: false })
  public config!: FlexSliderCardConfigMngr;          // reference to the card configuration

  @property({ attribute: false })
  public sliderClass!: FlexSliderCardFormat;

  @property({ type: Boolean })
  public forceHeight = false;          // reference to the card configuration

  @property({ attribute: false })
  public values: number[] = [0, 100];
  @property({ type: Boolean, reflect: true })
  public inactive = false;
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  private _slider!: NoUiSliderAPI;                   // reference to the noUiSlider instance
  private _userIsUpdating: boolean = false;                 // true when user is currently dragging the slider, false otherwise
  private _isSyncing: boolean = false;                         // true when the slider is being updated programmatically, false otherwise
  private _isAdjustingHandles: boolean = false;
  private _valuesBarSetMode: FlexSliderCardValuesBarSetModeCallback | null = null;
  private _valuesBarSetValue: FlexSliderCardValuesBarSetValueCallback | null = null;
  private _pressStartTime = 0;

  static override styles = css`
    ${unsafeCSS(nouiCss)}
    
    :host {
      display: block;
      width: 100%;
    }
    
    * {
      box-sizing: border-box;
    }
    
    .slider {
      width: 100%;
    }

    .slider.noUi-horizontal,
    .slider.noUi-horizontal * {
      -ms-touch-action: pan-y;
      touch-action: pan-y pinch-zoom;
    }

    .slider.noUi-vertical,
    .slider.noUi-vertical * {
      -ms-touch-action: pan-x;
      touch-action: pan-x pinch-zoom;
    }

    /* noUiSlider writes inline z-index values; keep the reference handle and bubble above editable handles. */
    .slider .noUi-origin.display-reference-origin {
      z-index: 1000 !important;
    }

    :host([inactive]) .slider.std.noUi-target,
    :host([inactive]) .slider.compact.noUi-target,
    :host([inactive]) .slider.std.noUi-vertical.noUi-target,
    :host([inactive]) .slider.compact.noUi-vertical.noUi-target {
      background: color-mix(in srgb, var(--disabled-color) 24%, transparent);
    }

    :host([inactive]) .slider.std .noUi-connect,
    :host([inactive]) .slider.compact .noUi-connect,
    :host([inactive]) .slider.std.noUi-vertical .noUi-connect,
    :host([inactive]) .slider.compact.noUi-vertical .noUi-connect {
      background: color-mix(in srgb, var(--disabled-text-color) 35%, transparent);
    }

    :host([inactive]) .slider.std.noUi-horizontal .noUi-handle,
    :host([inactive]) .slider.std.noUi-vertical .noUi-handle,
    :host([inactive]) .slider.compact.noUi-horizontal .noUi-handle,
    :host([inactive]) .slider.compact.noUi-vertical .noUi-handle {
      background: var(--disabled-text-color);
      border-color: var(--disabled-color);
    }

    :host([inactive]) .slider.std .noUi-tooltip,
    :host([inactive]) .slider.compact .noUi-tooltip {
      background: var(--ha-card-background, var(--card-background-color, var(--primary-background-color)));
      color: var(--disabled-text-color);
      border-color: var(--divider-color);
    }

    :host([inactive]) .slider.std.noUi-horizontal .noUi-marker-large,
    :host([inactive]) .slider.compact.noUi-horizontal .noUi-marker-large,
    :host([inactive]) .slider.std.noUi-vertical .noUi-marker-large,
    :host([inactive]) .slider.compact.noUi-vertical .noUi-marker-large,
    :host([inactive]) .slider.std.noUi-horizontal .noUi-marker-normal,
    :host([inactive]) .slider.compact.noUi-horizontal .noUi-marker-normal,
    :host([inactive]) .slider.std.noUi-vertical .noUi-marker-normal,
    :host([inactive]) .slider.compact.noUi-vertical .noUi-marker-normal {
      background: var(--divider-color);
    }

    :host([inactive]) .slider.std.noUi-horizontal .noUi-value-large,
    :host([inactive]) .slider.compact.noUi-horizontal .noUi-value-large,
    :host([inactive]) .slider.std.noUi-vertical .noUi-value-large,
    :host([inactive]) .slider.compact.noUi-vertical .noUi-value-large,
    :host([inactive]) .slider.std.noUi-vertical .noUi-pips-vertical,
    :host([inactive]) .slider.compact.noUi-vertical .noUi-pips-vertical {
      color: var(--disabled-text-color);
    }
    
    /* noUiSlider overrides */

    ${unsafeCSS(stdFlexSliderSliderCardCss)}
    ${unsafeCSS(compactFlexSliderSliderCardCss)}
    
  `;

  @query(".slider")
  private accessor _sliderElement!: NoUiSliderElement;

  /****************************************************/
  /* Public methods - Lit Element                     */
  /****************************************************/

  protected override firstUpdated(): void {
    if (!this.config) {
      throw new Error("Config not initialized");
    }

    const pipsValues = Array.from({ length: this.config.majorticks }, (_, i) => i * 100 / (this.config.majorticks - 1));
    const density = 100 / ((this.config.majorticks - 1) * (this.config.minorticks + 1));
    const tooltips = this._buildTooltips();

    noUiSlider.create(this._sliderElement, {
      start: this.values,
      orientation: this.config.orientation,
      direction: this.config.direction,
      tooltips: tooltips,
      connect: this.config.connect,
      range: {
        'min': this.config.min,
        'max': this.config.max
      },
      step: this.config.step,
      pips: this.config.hasTicks ? {
        mode: PipsMode.Positions,
        values: pipsValues,
        density: density,
        format: { to: (value) => this._sliderToPips(value) },
      } : undefined,
      behaviour: 'unconstrained',
    });
    this._slider = this._sliderElement.noUiSlider;           // reference to the noUiSlider instance

    if (this.config.hasReference) {
      const origins = this._slider.getOrigins();
      origins[this.config.entityCount]?.classList.add("ghost-max-origin");
      origins[this.values.length - 1]?.classList.add("display-reference-origin");
    }

    this._syncDisabledState();

    this._slider.on("start", (_values: (number | string)[], handle: number) => {
      this._onStart(handle);
    });

    this._slider.on("change", (values: (number | string)[]) => {
      void this._onChange(values);
    });

    this._slider.on("update", (values: (number | string)[], handle: number) => {
      this._onUpdate(values, handle);
    });

    this._slider.on("end", () => {
      this._onEnd();
    });
  }

  protected override updated(changedProps: Map<string, unknown>): void {
    if (!this._slider) return;

    if (changedProps.has("disabled")) {
      this._syncDisabledState();
    }

    if (this._userIsUpdating || this._isSyncing) return;

    if (changedProps.has("values")) {
      this._slider.set(this.values, false);
    }
  }

  protected override render() {
    const draggerClass = `${this.config.isDragOnlyBubbles ? "dragonly" : ""}`;
    const verticalLayoutClass = this.config.isVertical && this.config.verticalLayout === "mirrored"
      ? " mirrored"
      : "";
    const hasBubbles = this.config.hasBubbles;
    const hasReferenceBubble = this.config.hasReferenceBubble;
    const reservesBubbleSpace = hasBubbles || hasReferenceBubble;

    if (this.config.isVertical) {
      let height: string;
      if (this.forceHeight || this.config.sliderVerticalHeight == null) {
        height = "100%";
      } else {
        const cardHeight = CARD_HEIGHT_BASE + (this.config.sliderVerticalHeight - 1) * (CARD_HEIGHT_BASE + INTER_CARD);
        const titleHeight = this.config.hasTitle ? (this.config.isStd ? STD_TITLE_HEIGHT : COMPACT_TITLE_HEIGHT) : 0;
        const containerPadding = this.config.isStd
          ? STD_VERTICAL_CONTAINER_PADDING
          : COMPACT_VERTICAL_CONTAINER_PADDING;
        const paddingTop = this.config.hasTitle ? 0 : containerPadding;
        const paddingBottom = this.config.hasValuesBar ? 0 : containerPadding;
        height = `calc(${cardHeight - titleHeight - paddingTop - paddingBottom}px - var(--ha-card-border-total, 0px))`;
      }
      return html`
        <div
          class="slider-container ${this.sliderClass} vertical${verticalLayoutClass}"
          style="--height: ${height};"
        ><div class="slider ${this.sliderClass} ${draggerClass} vertical${verticalLayoutClass}"></div>
        </div>
      `;
    }

    let alignItems = "";
    let height = "";
    let padding = "";
    let marginTop = "";

    if (reservesBubbleSpace && this.config.hasTicks) {
      alignItems = "center";
      height = this.config.isStd ? "67px" : "50px";
      padding = this.config.isStd ? "0px" : "2px";
      marginTop = this.config.isStd ? "-1px" : "0px";
    } else if (reservesBubbleSpace) {
      alignItems = "flex-end";
      height = this.config.isStd ? "43px" : "32px";
      padding = this.config.isStd ? "1px" : "4px";
      marginTop = "0px";
    } else if (this.config.hasTicks) {
      alignItems = "flex-start";
      height = this.config.isStd ? "43px" : "28px";
      padding = this.config.isStd ? "0px" : "2px";
      marginTop = this.config.isStd ? "0px" : "2px";;
    } else {
      alignItems = "center";
      height = this.config.isStd ? "20px" : "14px";
      padding = "0px";
      marginTop = "0px";
    }
    return html`
      <div
        class="slider-container ${this.sliderClass}"
        style="
          --align-items: ${alignItems};
          --height: ${height};
          --padding: ${padding};
          --margin-top: ${marginTop};
        "
      > <div class="slider ${this.sliderClass} ${draggerClass}"></div>
      </div>
    `;
  }

  /****************************************************/
  /* Methods                                          */
  /****************************************************/
  public isUserUpdating(): boolean {
    return this._userIsUpdating;
  }

  public setCallbacks(setModeCallback: FlexSliderCardValuesBarSetModeCallback,
    setValueCallback: FlexSliderCardValuesBarSetValueCallback) {
    this._valuesBarSetMode = setModeCallback;
    this._valuesBarSetValue = setValueCallback;
  }

  /****************************************************/
  /* CallBacks                                        */
  /****************************************************/

  private _emitUserUpdateStateChanged(isUserUpdating: boolean): void {
    this.dispatchEvent(new CustomEvent("user-update-state-changed", {
      detail: { isUserUpdating },
      bubbles: true,
      composed: true,
    }));
  }

  private _onStart(handle: number): void {
    if (this.disabled) {
      return;
    }

    if (handle >= this.config.entityCount) {
      return;
    }

    debuglog(`slider start ${handle}`);
    this._pressStartTime = Date.now();

    this._userIsUpdating = true;
    this._emitUserUpdateStateChanged(true);
    this._valuesBarSetMode?.(FlexSliderCardValuesBarMode.USERUPDATE, handle);
  }

  private async _onChange(values: (number | string)[]): Promise<void> {
    debuglog("slider change");
    debuglog(`delay: ${Date.now() - this._pressStartTime}`);
    if (Date.now() - this._pressStartTime < PRESS_CONFIRM_DELAY_MS) {
      this._syncSliderToEntityValues();
      this._valuesBarSetMode?.(FlexSliderCardValuesBarMode.DEFAULT);
      return;
    }

    if (this.disabled) {
      this._valuesBarSetMode?.(FlexSliderCardValuesBarMode.DEFAULT);
      return;
    }

    const nextValues = values.map(Number).slice(0, this.config.entityCount);
    const currentValues = this.config.entities.map((entity) => entity.sliderValue);
    const changedIndexes = nextValues
      .map((value, index) => currentValues[index] === value ? -1 : index)
      .filter((index) => index !== -1);

    if (changedIndexes.length === 0) {
      this._valuesBarSetMode?.(FlexSliderCardValuesBarMode.DEFAULT);
      return;
    }

    this._isSyncing = true;
    try {
      if (this.config.handlesBehavior === "unconstrained") {
        await this._commitChangedValues(changedIndexes, nextValues);
      } else {
        await this._commitChangedValuesInOrder(currentValues, nextValues, changedIndexes);
      }
    } catch (error) {
      this._syncSliderToEntityValues();
      const message = FlexSliderCardSlider._getErrorMessage(error);
      fireEvent(this, "hass-notification" as any, { message });
    } finally {
      this._isSyncing = false;
      if (this._userIsUpdating) return;
      this._valuesBarSetMode?.(FlexSliderCardValuesBarMode.DEFAULT);
    }
  }

  private _onUpdate(values: (number | string)[], handle: number): void {
    debuglog("slider update");
    const numbers: number[] = values.map(Number);
    const editableValues = numbers.slice(0, this.config.entityCount);

    if (handle >= this.config.entityCount) {
      this._valuesBarSetValue?.(editableValues);
      return;
    }

    if (!this._isAdjustingHandles) {
      const adjustedValues = this._getAdjustedHandleValues(editableValues, handle);
      if (adjustedValues !== null) {
        this._isAdjustingHandles = true;
        try {
          adjustedValues.forEach((value, index) => {
            if (value !== numbers[index]) {
              this._slider.setHandle(index, value, false, false);
            }
          });
        } finally {
          this._isAdjustingHandles = false;
        }
        this._valuesBarSetValue?.(adjustedValues);
        return;
      }
    }

    this._valuesBarSetValue?.(editableValues);
  }

  private _onEnd(): void {
    debuglog("slider end");
    this._pressStartTime = 0;
    this._userIsUpdating = false;
    this._emitUserUpdateStateChanged(false);
    if (this._isSyncing) return;
    this._valuesBarSetMode?.(FlexSliderCardValuesBarMode.DEFAULT);
  }

  /****************************************************/
  /* Private methods                                  */
  /****************************************************/

  private static _getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }

    return `Error occurred while updating slider values: ${String(error)}`;
  }

  private _syncSliderToEntityValues(): void {
    const values = this.config.hasReference
      ? [
          ...this.config.entities.map((entity) => entity.sliderValue),
          this.config.max,
          this.config.referenceEntity.sliderValue,
        ]
      : this.config.entities.map((entity) => entity.sliderValue);

    this._slider.set(values, false);
    this._valuesBarSetValue?.(values.slice(0, this.config.entityCount));
  }

  private async _commitChangedValues(
    changedIndexes: number[],
    nextValues: number[],
  ): Promise<void> {
    for (const index of changedIndexes) {
      await this.config.entities[index].setSliderValue(nextValues[index]);
    }
  }

  private async _commitChangedValuesInOrder(
    currentValues: number[],
    nextValues: number[],
    changedIndexes: number[],
  ): Promise<void> {
    const workingValues = [...currentValues];
    const pendingIndexes = new Set(changedIndexes);

    while (pendingIndexes.size > 0) {
      let progressed = false;

      for (const index of Array.from(pendingIndexes)) {
        const leftValue = index === 0 ? Number.NEGATIVE_INFINITY : workingValues[index - 1];
        const rightValue = index === workingValues.length - 1 ? Number.POSITIVE_INFINITY : workingValues[index + 1];
        const targetValue = nextValues[index];

        if (leftValue <= targetValue && targetValue <= rightValue) {
          await this.config.entities[index].setSliderValue(targetValue);
          workingValues[index] = targetValue;
          pendingIndexes.delete(index);
          progressed = true;
        }
      }

      if (!progressed) {
        throw new Error("Unable to update entities while preserving non-decreasing handle order");
      }
    }
  }

  private _getAdjustedHandleValues(
    values: number[],
    handle: number,
  ): number[] | null {
    if (this.config.handlesBehavior === "unconstrained") {
      return null;
    }

    const nextValues = [...values];

    if (this.config.handlesBehavior === "flexible") {
      for (let index = handle + 1; index < nextValues.length; index += 1) {
        if (nextValues[index] < nextValues[index - 1]) {
          nextValues[index] = nextValues[index - 1];
        }
      }

      for (let index = handle - 1; index >= 0; index -= 1) {
        if (nextValues[index] > nextValues[index + 1]) {
          nextValues[index] = nextValues[index + 1];
        }
      }
    } else if (this.config.handlesBehavior === "fixed") {
      const leftBound = handle === 0 ? Number.NEGATIVE_INFINITY : nextValues[handle - 1];
      const rightBound = handle === nextValues.length - 1 ? Number.POSITIVE_INFINITY : nextValues[handle + 1];
      nextValues[handle] = Math.min(Math.max(nextValues[handle], leftBound), rightBound);
    }

    return nextValues;
  }

  private _syncDisabledState(): void {
    if (!this._slider) {
      return;
    }

    if (this.disabled) {
      if (this._userIsUpdating) {
        this._userIsUpdating = false;
        this._emitUserUpdateStateChanged(false);
        this._valuesBarSetMode?.(FlexSliderCardValuesBarMode.DEFAULT);
      }
      this._slider.disable();
      return;
    }

    this._slider.enable();
    if (this.config.hasReference) {
      this._slider.disable(this.config.entityCount);
      this._slider.disable(this.values.length - 1);
    }
  }

  private _buildTooltips(): false | ({ to: (value: number) => string } | false)[] {
    if (!this.config.hasBubbles && !this.config.hasReferenceBubble) {
      return false;
    }

    const tooltips: ({ to: (value: number) => string } | false)[] = this.config.entities.map((_, index) => (
      this.config.hasBubbles
        ? { to: (value: number) => this._sliderToBubble(value, index) }
        : false
    ));

    if (this.config.hasReference) {
      tooltips.push(false);
      tooltips.push(
        this.config.hasReferenceBubble
          ? { to: (value: number) => this._sliderToReferenceBubble(value) }
          : false
      );
    }

    return tooltips;
  }

  private _sliderToPips(value: number): string {
    let valueToDisplay: string = "";

    if (
      this.config?.entitytype === FlexSliderCardEntityType.NUMBER ||
      this.config?.entitytype === FlexSliderCardEntityType.COVER
    ) {
      valueToDisplay = Number(value).toFixed(Number(this.config.nbdigitsTicks));
    } else if (this.config?.entitytype === FlexSliderCardEntityType.TIME) {
      valueToDisplay = minutesToTime(value);
    } else {
      throw new Error("Unsupported entity type");
    }

    return valueToDisplay;
  }

  private _sliderToBubble(value: number, handle: number): string {
    return this.config.entities[handle].toText(
      value,
      this.config.nbdigitsBubbles,
      this.config.unitBubbles,
      this.config.showTextBubbles,
    );
  }

  private _sliderToReferenceBubble(value: number): string {
    return this.config.referenceEntity.toText(
      value,
      this.config.nbdigitsBubbles,
      this.config.referenceUnit,
      true,
    );
  }
  
}
