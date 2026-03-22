import { html, css, LitElement, unsafeCSS, nothing } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { stdFlexSliderCardCss } from "./css/std-flex-slider-css"
import { compactFlexSliderCardCss } from "./css/compact-flex-slider-css"
import { FlexSliderCardConfigMngr,  } from "./config/flex-slider-card-config";
import { FlexSliderCardConfig } from "./config/flex-slider-card-config-type";
import { debuglog } from "./utils/utils";
import { FlexSliderCardSlider, NoUiSliderElement } from "./flex-slider-card-slider";
import { HomeAssistant, LovelaceCard } from "custom-card-helpers";
import "./flex-slider-card-valuesbar";

type GridOptions =
  {
    rows?: number;
    min_rows?: number;
    max_rows?: number;
    columns?: number;
    min_columns?: number;
    max_columns?: number;
  };

@customElement("flex-slider-card")
export class FlexSliderCard extends LitElement implements LovelaceCard  {

  /****************************************************/
  /* private parameters                               */
  /****************************************************/

  @property({ attribute: false })
  public hass!: HomeAssistant;
  @state()
  private _error?: string;
  @query("#slider")
  private _sliderHtmlElement?: NoUiSliderElement;          // reference to the DOM element in which the slider is created
  @query("flex-slider-card-valuesbar")
  private _valuesBarElement?: LitElement;                // reference to the values bar element

  private _slider?: FlexSliderCardSlider;            // reference to the noUiSlider instance
  private _firstUpdate: boolean = true;           // flag to indicate if it is the first update of the card
  private _config?: FlexSliderCardConfigMngr;        // reference to the card configuration

  static override styles = css`
    * {
      box-sizing: border-box;
    }
    ha-card {
      height: 100%;
    }
    ${unsafeCSS(stdFlexSliderCardCss)}
    ${unsafeCSS(compactFlexSliderCardCss)}
  `;

  /****************************************************/
  /* Public methods - Home Assistant                  */
  /****************************************************/

  constructor() {
    super();
    debuglog("constructor");
  }
  
  public setConfig(config: FlexSliderCardConfig): void {
    debuglog("setConfig");
    try {
      this._config = new FlexSliderCardConfigMngr(config);
      this._error = undefined;
      if (this._config.isStd()) {
        this.toggleAttribute("std", true);
        this.toggleAttribute("compact", false);
      } else if (this._config.isCompact()) {
        this.toggleAttribute("std", false);
        this.toggleAttribute("compact", true);
      } else {
        throw new Error("Invalid format in setConfig");
      }
    } catch (error) {
      this._setError(error);
    }
  }
  
  public connectedCallback(): void {
    super.connectedCallback();
    debuglog("connectedCallback");
  }
  
  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._slider) {
      // this._slider.destroy();
    }
    this._initPrivateDisplayData();
    debuglog("disconnectedCallback");
  }

  public getCardSize(): number | Promise<number> {
    if (!this._config) {
      throw new Error("Config not initialized");
    }
    if (this._config.isStd()) {
      return 2;
    } else if (this._config.isCompact()) {
      return 1;
    } else {
      throw new Error("Invalid format in getCardSize");
    }
  }

  public getGridOptions(): GridOptions {
    if (!this._config) {
      throw new Error("Config not initialized");
    }
    if (this._config.isStd()) {
      if (this._config.hasTitle() && this._config.hasValuesBar()) {
        return {
          rows: 2,
          min_rows: 2,
          min_columns: 6,
          max_columns: 12
        };
      } else {
        return {
          rows: 1,
          min_rows: 1,
          min_columns: 6,
          max_columns: 12
        };
      }
    } else if (this._config.isCompact()) {
      return {
        min_rows: 1,
        min_columns: 2,
        max_columns: 9
      };
    } else {
      throw new Error("Invalid format in getGridOptions");
    }
  }

  /****************************************************/
  /* Public methods - Lit Element                     */
  /****************************************************/

  protected override willUpdate(changedProps: Map<string, unknown>): void {
    if (!this._config || !this.hass) {
      return;
    }
    if (this._firstUpdate) {
      this._firstUpdate = false;
      this._config.update(this.hass);
    } else if (changedProps.has("hass")) {
      this._config.update(this.hass);
    }
  }

  protected override firstUpdated(): void {
    if (!this._config) {
      throw new Error("Config not initialized");
    }
    this._initSlider();
  }

  protected override updated(changedProps: Map<string, unknown>): void {
    if (!this._config || !this._slider) {
      return;
    }
    if (changedProps.has("hass") && this._config?.entitiesIsUpdated() ) {
      this._valuesBarElement?.requestUpdate();
      this._updateSlider();
    }
  }

  protected override render() {
    if (this._error) {
      return html`<ha-card><div class="card-content">${this._error}</div></ha-card>`;
    }

    if (!this._config) {
      return nothing;
    }

    if (!this._config.entitiesExist()) {
      return html`<ha-card><div class="card-content">Entities not found</div></ha-card>`;
    }

    const hasValuesBar = this._config.hasValuesBar();
    const hasTitle = this._config.hasTitle();
    const name = this._config.title;
    const isStd = this._config.isStd();
    const containerClass = `${isStd ? "std" : "compact"} ${hasTitle ? "" : "no-title"}`;

    return html`
      <div class="container ${containerClass}">
        ${hasTitle ? html`<div class="title">${name}</div>` : nothing}

        <div class="slider-with-values">
          <div class="slider-container">
            <div class="slider" id="slider"></div>
          </div>

          ${hasValuesBar
            ? html`
              <flex-slider-card-valuesbar
                .config=${this._config}
              ></flex-slider-card-valuesbar>
            `
          : nothing}
        </div>
      </div>
    `;
  }

  /****************************************************/
  /* Private parameters                               */
  /****************************************************/

  private _initPrivateDisplayData(): void {                           //parameters initialized by the constructor or when the card is disconnected
    // this._slider = undefined;                                // reference to the noUiSlider instance
    this._firstUpdate = true;                                 // flag to indicate if it is the first update of the card
  }

  /****************************************************/
  /* Slider Management                                */
  /****************************************************/

  public _initSlider(): void {
    if (!this._config) {
      throw new Error("Config not initialized");
    }
    
    if (this._slider) return;

    if (!this._sliderHtmlElement) {
      throw new Error("Slider HTML element not initialized");
    }

    const min = this._config.entities.min.sliderValue;
    const max = this._config.entities.max.sliderValue;
    this._slider = new FlexSliderCardSlider(
      this._config,
      min,
      max,
      this._sliderHtmlElement
    );
    this._config.entitiesSetBaseline();
  }

    public _updateSlider(): void {
    if (!this._config) {
      throw new Error("Config not initialized");
    }
    if (!this._slider) {
      throw new Error("Slider not initialized");
    }
    if (this._slider.isUserUpdating()) {
      return;
    }
    if (this._config.entitiesIsUpdated()) {
      const min = this._config.entities.min.sliderValue;
      const max = this._config.entities.max.sliderValue;
      this._slider.update(min, max);
      this._config.entitiesSetBaseline();
    }
  }

  /****************************************************/
  /* Error Management                                 */
  /****************************************************/

  private _setError(error: unknown): never {
    debuglog("ERROR");

    if (error instanceof Error) {
      this._error = error.message;
      throw error;
    }

    this._error = "Unknown error " + String(error);
    throw new Error(this._error);
  }

}