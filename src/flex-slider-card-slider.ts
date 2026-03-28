import noUiSlider, { API as NoUiSliderAPI } from "nouislider";
import { debuglog } from "./utils/utils";
import { FlexSliderCardConfigMngr } from "./config/flex-slider-card-config";
import { css, html, LitElement, unsafeCSS } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import nouiCss from "nouislider/dist/nouislider.css?inline";
import { stdFlexSliderSliderCardCss } from "./css/std-flex-slider-slider-css";
import { compactFlexSliderSliderCardCss } from "./css/compact-flex-slider-slider-css";
import { FlexSliderCardFormat } from "./config/flex-slider-card-config-type";


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
  public sliderClass: FlexSliderCardFormat = "std";          // reference to the card configuration

  @property({ type: Number })
  public minvalue = 0;

  @property({ type: Number })
  public maxvalue = 100;

  private _slider!: NoUiSliderAPI;                   // reference to the noUiSlider instance
  private _userIsUpdating: boolean = false;                 // true when user is currently dragging the slider, false otherwise
  private _isSyncing: boolean = false;                         // true when the slider is being updated programmatically, false otherwise

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
    
    noUiSlider.create(this._sliderElement, {
      start: [this.minvalue, this.maxvalue],
      connect: true,
      range: {
        'min': this.config.min,
        'max': this.config.max
      },
      step: this.config.step
    });
    this._slider = this._sliderElement.noUiSlider;           // reference to the noUiSlider instance
    
    this._slider.on("start", () => {
      this._onStart();
    });
    
    this._slider.on("change", (values: (number | string)[]) => {
      void this._onChange(values);
    });
    
    this._slider.on("update", (values: (number | string)[]) => {
      this._onUpdate(values);
    });

    this._slider.on("end", () => {
      this._onEnd();
    });
  }

  protected override updated(changedProps: Map<string, unknown>): void {
    if (!this._slider || this._userIsUpdating || this._isSyncing) return;

    if (changedProps.has("minvalue") || changedProps.has("maxvalue")) {
      this._slider.set([this.minvalue, this.maxvalue], false);
    }
  }

  protected override render() {
    return html`<div class="slider ${this.sliderClass}"></div>`;
  }

  /****************************************************/
  /* Methods                                          */
  /****************************************************/
  public isUserUpdating(): boolean {
    return this._userIsUpdating;
  }

  /****************************************************/
  /* CallBacks                                        */
  /****************************************************/

  private _onStart(): void {
    debuglog("slider start");
    this._userIsUpdating = true;
  }

  private async _onChange(values: (number | string)[]): Promise<void> {
    debuglog("slider change");
    
    // noUiSlider renvoie souvent des strings → conversion recommandée
    const min = Number(values[0]);
    const max = Number(values[1]);

    this._isSyncing = true;
    try {
      await Promise.all([
        this.config.entities.min.setSliderValue(min),
        this.config.entities.max.setSliderValue(max)
      ]);
    } catch (error) {
      console.error("Error occurred while updating slider values:", error);
    } finally {
      this._isSyncing = false;
    }
  }

  private _onUpdate(values: (number | string)[]): void {
    debuglog("slider update");
    if (this.config.hasValuesBar()) {
      const numbers: number[] = values.map(Number);
      // this._config.valuesBar!.updateValues(numbers);
    }
  }

  private _onEnd(): void {
    debuglog("slider end");
    this._userIsUpdating = false;
  }

}