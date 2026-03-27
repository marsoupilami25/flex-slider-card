import { debuglog, minutesToTime } from "./utils/utils";
import { FlexSliderCardEntity, FlexSliderCardEntityType } from "./flex-slider-card-entity";
import { FlexSliderCardConfigMngr } from "./config/flex-slider-card-config";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("flex-slider-card-valuesbar")
export class FlexSliderCardValuesBar extends LitElement {

  /****************************************************/
  /* private parameters                               */
  /****************************************************/

  @property({ attribute: false }) 
  public config!: FlexSliderCardConfigMngr;
 
  @property({ type: Number })
  public minvalue = 0;

  @property({ type: Number })
  public maxvalue = 100;

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
  `;

  /****************************************************/
  /* Public methods - Lit Element                     */
  /****************************************************/

  protected override render() {
    debuglog("rendering values bar");
    
    if (!this.config) {
      return html`<div class="valuesbar">No config found</div>`;
    }

    if (!this.config.entitiesExist()) {
      return html`<div class="valuesbar">Entities not found</div>`;
    }

    const min = this._minValue;
    const max = this._maxValue;
    
    if (this.config.hasValuesBar()) {
      // Values bar is enabled
      return html`
        <div class="valuesbar">
          <span id="min-value">${min}</span>
          <span id="max-value">${max}</span>
        </div>
      `;
    } else {
      // Values bar is disabled, render nothing
      return nothing;
    }
    
  }

  /****************************************************/
  /* Public methods - Values Bar                      */
  /****************************************************/

  /* public updateValues(values: number[]): void {
    const mintext = this._config.mintext;
    const maxtext = this._config.maxtext;
    const unit = this._config.unit;
    const minVal = this._sliderToDisplay(values[0]);
    const maxVal = this._sliderToDisplay(values[1]);
    const minElement = this._valueBarElement.querySelector<HTMLElement>("#min-value");
    const maxElement = this._valueBarElement.querySelector<HTMLElement>("#max-value");
    
    if (!minElement || !maxElement) {
      throw new Error("Value bar elements not found in DOM");
    }
    
    minElement.textContent = `${mintext}${minVal}${unit}`;
    maxElement.textContent = `${maxtext}${maxVal}${unit}`;
  } */

  /****************************************************/
  /* Private methods - Values Bar                     */
  /****************************************************/

  private get _minValue(): string {
    const mintext = this.config.mintext;
    const unit = this.config.unit;
    const minDisplay = this._sliderToDisplay(this.minvalue);
    return `${mintext}${minDisplay}${unit}`;
  }

  private get _maxValue(): string {
    const maxtext = this.config.maxtext;
    const unit = this.config.unit;
    const maxDisplay = this._sliderToDisplay(this.maxvalue);
    return `${maxtext}${maxDisplay}${unit}`;
  }

  private _sliderToDisplay(value: number): string {
    if (this.config.entitytype == FlexSliderCardEntityType.NUMBER) {
      return Number(value).toFixed(Number(this.config.digits));
    }
    if (this.config.entitytype == FlexSliderCardEntityType.TIME) {
      return minutesToTime(value);
    }
    throw new Error("Unsupported entity type");
  }

}