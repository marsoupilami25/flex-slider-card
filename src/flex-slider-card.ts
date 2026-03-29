import { html, css, LitElement, unsafeCSS, nothing, PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { stdFlexSliderCardCss } from "./css/std-flex-slider-css"
import { compactFlexSliderCardCss } from "./css/compact-flex-slider-css"
import { FlexSliderCardConfigMngr } from "./config/flex-slider-card-config";
import { FlexSliderCardConfig, flexSliderCardConfigStruct } from "./config/flex-slider-card-config-type";
import { debuglog } from "./utils/utils";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";
import "./flex-slider-card-valuesbar";
import "./flex-slider-card-slider";
import { FlexSliderCardValuesBar } from "./flex-slider-card-valuesbar";
import { FlexSliderCardSlider } from "./flex-slider-card-slider";
import { flexSliderCardConfigStub } from "./config/flex-slider-card-config-stub";
import { assert } from "superstruct";

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
  @query('flex-slider-card-slider')
  private _slider!: FlexSliderCardSlider;
  @query('flex-slider-card-valuesbar')
  private _valuesBar?: FlexSliderCardValuesBar;

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
  /* Public methods - Config Management               */
  /****************************************************/

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./config/flex-slider-card-config-editor");
    return document.createElement("flex-slider-card-config-editor") as LovelaceCardEditor;
  }

  public static getStubConfig(): FlexSliderCardConfig {
    return flexSliderCardConfigStub;
  }

  public setConfig(config: FlexSliderCardConfig): void {
    debuglog("setConfig");
    assert(config, flexSliderCardConfigStruct);
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
  


  /****************************************************/
  /* Public methods - Home Assistant                  */
  /****************************************************/

  constructor() {
    super();
    debuglog("constructor");
  }
  
  public connectedCallback(): void {
    super.connectedCallback();
    debuglog("connectedCallback");
  }
  
  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._initPrivateDisplayData();
    this._config?.reset();
    debuglog("disconnectedCallback");
  }

  public getCardSize(): number | Promise<number> {
    if (!this._config) {
      return 1;
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
      return {};
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

    if (this._firstUpdate || changedProps.has("hass")) {
      this._firstUpdate = false;
      this._config.update(this.hass);
    }
  }

  protected override firstUpdated(_changedProperties: PropertyValues): void {
    if (!this._config) {
      return;
    }
    if (this._config.hasValuesBar()) {
      this._slider.setCallbacks(this._valuesBar!.setMode, this._valuesBar!.setValue);
    }
  }

  protected override updated(changedProps: Map<string, unknown>): void {
    if (!this._config) {
      return;
    }
    if (changedProps.has("hass")) {
      this._config.entitiesSetBaseline();
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
    const sliderClass = `${isStd ? "std" : "compact"}`;
    const minValue = this._config.entities.min.sliderValue;
    const maxValue = this._config.entities.max.sliderValue;

    return html`
      <div class="container ${containerClass}">
        ${hasTitle ? html`<div class="title">${name}</div>` : nothing}

        <div class="slider-with-values">
          <div class="slider-container">
            <flex-slider-card-slider
              .config=${this._config}
              .minvalue=${minValue}
              .maxvalue=${maxValue} 
              .sliderClass=${sliderClass}             
            ></flex-slider-card-slider>
          </div>

          ${hasValuesBar
            ? html`
              <flex-slider-card-valuesbar
                .config=${this._config}
                .minvalue=${minValue}
                .maxvalue=${maxValue}              
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
    this._firstUpdate = true;                                 // flag to indicate if it is the first update of the card
  }

  /****************************************************/
  /* Error Management                                 */
  /****************************************************/

  private _setError(error: unknown): void {
    debuglog("ERROR");

    if (error instanceof Error) {
      this._error = error.message;
      return;
    }

    this._error = "Unknown error " + String(error);
  }

}