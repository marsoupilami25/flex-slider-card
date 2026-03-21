import { stdFlexSliderCardCss } from "./css/std-flex-slider-css"
import { compactFlexSliderCardCss } from "./css/compact-flex-slider-css"
import { FlexSliderCardConfigMngr,  } from "./config/flex-slider-card-config";
import { FlexSliderCardConfig } from "./config/flex-slider-card-config-type";
import { debuglog } from "./utils/utils";
import { FlexSliderCardSlider } from "./flex-slider-card-slider";
import { FlexSliderCardValuesBar } from "./flex-slider-card-valuesbar";
import { HomeAssistant, LovelaceCard } from "custom-card-helpers";
import { NoUiSliderElement } from "./flex-slider-card-slider";

enum FlexSliderCardState {
  DISCONNECTED = 0,
  CONNECTED = 1,
  OPER = 2,
  IDLE = 3,
  ERROR = 4
}

type GridOptions =
  {
    rows?: number;
    min_rows?: number;
    max_rows?: number;
    columns?: number;
    min_columns?: number;
    max_columns?: number;
  };

export class FlexSliderCard extends HTMLElement implements LovelaceCard  {

  /****************************************************/
  /* private parameters                               */
  /****************************************************/

  private _state: FlexSliderCardState = FlexSliderCardState.DISCONNECTED;   // current state of the card
  private _config: FlexSliderCardConfigMngr | undefined;        // reference to the card configuration
  private _sliderHtmlElement: NoUiSliderElement | null | undefined;          // reference to the DOM element in which the slider is created
  private _slider: FlexSliderCardSlider | undefined;            // reference to the noUiSlider instance
  private _userIsUpdating: boolean = false;
  private _updateHtmlElementInProgress: boolean = false;        // true when _updateValuesDisplay is currently running, false otherwise
  private _updateHtmlElementRequestPending: boolean = false;    // true if a call to _updateValuesDisplay was requested while it was already running, false otherwise

  /****************************************************/
  /* Public methods                                   */
  /****************************************************/

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._initPrivateConfig();
    this._toDisconnectedState();
    debuglog("constructor");
  }
  
  public setConfig(config: FlexSliderCardConfig): void {
    debuglog("setConfig");
    try {
      this._config = new FlexSliderCardConfigMngr(config);
    } catch (error) {
      this._toErrorState(error);
    }
  }
  
  public connectedCallback(): void {
    debuglog("connectedCallback");
    this._toConnectedState();
  }
  
  public disconnectedCallback(): void {
    debuglog("disconnectedCallback");
    this._toDisconnectedState();
  }
  
  public set hass(hass: HomeAssistant) {
    debuglog("hass");
    if (this._config) {
      this._config.update(hass);
      if (this._state == FlexSliderCardState.CONNECTED) {
        this._toOperState();
      }
    }
    if (this._state == FlexSliderCardState.OPER) {
      this._Oper();
    }
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
  /* Private parameters                               */
  /****************************************************/

  private _initPrivateConfig(): void {        // parameters initialized by constructor
    this._config = undefined;         // user configuration object
  }
  
  private _initPrivateDisplayData(): void {                           //parameters initialized by the constructor or when the card is disconnected
    this._userIsUpdating = false;                       //true when user is currently dragging the slider, false otherwise
    this._slider = undefined;                                // reference to the noUiSlider instance
    this._updateHtmlElementInProgress = false;        // true when _updateValuesDisplay is currently running, false otherwise
    this._updateHtmlElementRequestPending = false;    // true if a call to _updateValuesDisplay was requested while it was already running, false otherwise
    this._sliderHtmlElement = undefined;                         // reference to the DOM element in which the slider is created
  }

  /****************************************************/
  /* Utilities                                        */
  /****************************************************/

  /****************************************************/
  /* State Management                                 */
  /****************************************************/

  private _toDisconnectedState(): void {
    if (this._slider) {
      this._slider.destroy();
    }
    this._initPrivateDisplayData();
    this._state = FlexSliderCardState.DISCONNECTED;   // current state of the card is DISCONNECTED
  }

  private _toConnectedState(): void {
    if (this._state == FlexSliderCardState.DISCONNECTED) {
      this._state = FlexSliderCardState.CONNECTED;
      debuglog("CONNECTED");
    } else {
      debuglog("Unexpected state when connecting: "+this._state);
      throw new Error("Unexpected state when connecting: "+this._state);
    }
  }

  private _toErrorState(error: unknown): never {
    this._state = FlexSliderCardState.ERROR;
    debuglog("ERROR");
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Unknown error "+String(error));
    }
  } 
  private _toIdleState(): void {
    this._state = FlexSliderCardState.IDLE;
    debuglog("IDLE");
  }

  private _toOperState(): void {
    debuglog("INIT");
    try {
      if (!this._createHtmlElement()) {
        this._toIdleState();
        return;
      } 
      this._initSlider();
    } catch (error) {
      this._toErrorState(error);
    }
    debuglog("OPER");
    this._state = FlexSliderCardState.OPER;
  }

  private _Oper(): void {
    this._updateHtmlElement();
  }

  /****************************************************/
  /* HTML Management                                  */
  /****************************************************/

  private _createHtmlElement(): boolean {
    if (!this._config) {
      throw new Error("Config not initialized");
    }
    if (!this.shadowRoot) {
      throw new Error("Shadow root not initialized");
    }
    if (!this._config.entitiesExist()) {
      this.shadowRoot.innerHTML = `<p>Entities not found</p>`;
      return false;
    }
    
    const hasvaluesbar = this._config.hasValuesBar();
    const hasTitle = this._config.hasTitle();
    const name = this._config.title;

    let css = '';

    if (this._config.isStd()) {
      css = stdFlexSliderCardCss;
    } else if (this._config.isCompact()) {
      css = compactFlexSliderCardCss;
    } else {
      throw new Error("Invalid format in _renderTemplate method");
    }

    this.shadowRoot.innerHTML = `
      <style>
        ${css}
      </style>

      <div class="container ${hasTitle ? "" : "no-title"}">
        ${hasTitle ? `<div class="title">${name}</div>` : ""}
        <div class="slider-with-values">
          <div class="slider-container">
            <div class="slider" id="slider"></div>
          </div>
          ${hasvaluesbar ? `
            <div class="values">
              <span id="min-value"></span>
              <span id="max-value"></span>
            </div>
          ` : ""}
        </div>
      </div>
    `;

    if (hasvaluesbar) {
      const valueElement: HTMLElement | null = this.shadowRoot.querySelector(".values");
      if (!valueElement) {
        throw new Error("Values bar element not found in DOM");
      }
      const valuesBar = new FlexSliderCardValuesBar(this._config, valueElement);
      this._config.valuesBar = valuesBar;
    }    
    
    const element = this.shadowRoot.getElementById("slider");
    if (!element) {
      throw new Error("Slider element not found in DOM");
    }
    this._sliderHtmlElement = element as NoUiSliderElement;
    return true;
  }
  
  private _updateHtmlElement(): void {
    if (!this._config || !this._slider) {
      return;
    }
    
    if (this._updateHtmlElementInProgress) {
      this._updateHtmlElementRequestPending = true;
      return;
    }
    this._updateHtmlElementInProgress = true;
    
    try {
      if (this._slider.isUserUpdating()) {
        return;
      }
      if (this._config.entitiesIsUpdated()) {
        const min = this._config.entities.min.sliderValue;
        const max = this._config.entities.max.sliderValue;
        this._slider.update(min, max);
        this._config.entitiesSetBaseline();
      } else {
      }
    } finally {
      this._updateHtmlElementInProgress = false;
      if (this._updateHtmlElementRequestPending) {
        this._updateHtmlElementRequestPending = false;
        queueMicrotask(() => this._updateHtmlElement());
      }
    }
    return;
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
  
}

customElements.define('flex-slider-card', FlexSliderCard);