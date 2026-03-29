import { debuglog, minutesToTime } from "./utils/utils";
import { FlexSliderCardEntityType } from "./flex-slider-card-entity";
import { FlexSliderCardConfigMngr } from "./config/flex-slider-card-config";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

export enum FlexSliderCardValuesBarMode {
  DEFAULT = "default",
  USERUPDATE = "userupdate"
}

export type FlexSliderCardValuesBarSetModeCallback = (mode: FlexSliderCardValuesBarMode, handle?: number) => void;
export type FlexSliderCardValuesBarSetValueCallback = (values: number[]) => void;

@customElement("flex-slider-card-valuesbar")
export class FlexSliderCardValuesBar extends LitElement {

  /****************************************************/
  /* private parameters                               */
  /****************************************************/

  @property({ attribute: false }) 
  public config?: FlexSliderCardConfigMngr;
  @property({ type: Number })
  public minvalue = 0;
  @property({ type: Number })
  public maxvalue = 100;

  private _mode: FlexSliderCardValuesBarMode = FlexSliderCardValuesBarMode.DEFAULT;   // mode of the values bar, either "default" or "userupdate"
  private _handle: number | null = null;                                                      // index of the handle currently being updated by the user, null if no handle is being updated
  private _userModifiedValue: number | null = null;                                               // value currently being updated by the user, null if no value is being updated

  static override styles = css`
    * {
      box-sizing: border-box;
    }
    .valuesbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      color: var(--primary-text-color);
      font-size: var(--flex-slider-card-barvalues-font-size);
      padding-bottom: var(--flex-slider-card-barvalues-padding-bottom);
      /* border: 1px solid blue; /* Debugging border */
    }
    .editing {
      color: var(--primary-color);
      font-style: italic;
    }
  `;

  /****************************************************/
  /* Public methods - Lit Element                     */
  /****************************************************/

  protected override render() {
    debuglog("rendering values bar");
    
    if (!this.config || !this.config.entitiesExist()) {
      return nothing;
    }

    if (!this.config.hasValuesBar()) {
      return nothing;
    }

    return html`
      <div class="valuesbar">
        <span>
          ${this.config?.mintext || ""}
          <span class=${this._isEditing(0) ? "editing" : ""}>
            ${this._minValue}
          </span>
          ${this.config?.unit || ""}
        </span>

        <span>
          ${this.config?.maxtext || ""}
          <span class=${this._isEditing(1) ? "editing" : ""}>
            ${this._maxValue}
          </span>
          ${this.config?.unit || ""}
        </span>
      </div>
    `;
    
  }

  /****************************************************/
  /* Public methods - Values Bar                      */
  /****************************************************/

  public setMode: FlexSliderCardValuesBarSetModeCallback = (mode, handle) => {
    this._mode = mode;
    this._handle = handle !== undefined ? handle : null;
    if (mode === FlexSliderCardValuesBarMode.USERUPDATE && handle === undefined) {
      throw new Error("Handle must be provided when mode is 'userupdate'");
    }
    if (mode === FlexSliderCardValuesBarMode.DEFAULT) {
      this._handle = null;
      this._userModifiedValue = null;
    }
    this.requestUpdate();
  };

  public setValue: FlexSliderCardValuesBarSetValueCallback = (values) => {
    if (this._mode !== FlexSliderCardValuesBarMode.USERUPDATE) {
      return;
    }
    if (this._handle != undefined) {
      this._userModifiedValue = values[this._handle];
    }
    this.requestUpdate();
  };

  /****************************************************/
  /* Private methods - Values Bar                     */
  /****************************************************/

  private _isEditing(handle: number): boolean {
    return (
      this._mode === FlexSliderCardValuesBarMode.USERUPDATE &&
      this._handle === handle
    );
  }
  private get _minValue(): string {
    if (this._mode === FlexSliderCardValuesBarMode.USERUPDATE && 
      this._userModifiedValue != undefined && 
      this._handle === 0) {
      return this._sliderToDisplay(this._userModifiedValue);  // min value is always the first handle (0)
    }  
    return this._sliderToDisplay(this.minvalue);
  }

  private get _maxValue(): string {
    if (this._mode === FlexSliderCardValuesBarMode.USERUPDATE && 
      this._userModifiedValue != undefined && 
      this._handle === 1) {
      return this._sliderToDisplay(this._userModifiedValue);
    }
    return this._sliderToDisplay(this.maxvalue);
  }

  private _sliderToDisplay(value: number): string {
    if (this.config?.entitytype === FlexSliderCardEntityType.NUMBER) {
      return Number(value).toFixed(Number(this.config.nbdigits));
    }
    if (this.config?.entitytype === FlexSliderCardEntityType.TIME) {
      return minutesToTime(value);
    }
    throw new Error("Unsupported entity type");
  }

}