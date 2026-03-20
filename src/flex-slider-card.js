import { stdFlexSliderCardCss } from "./css/std-flex-slider-css"
import { compactFlexSliderCardCss } from "./css/compact-flex-slider-css"
import { FlexSliderCardConfigMngr } from "./config/flex-slider-card-config";
import { debuglog } from "./utils/utils";
import { FlexSliderCardSlider } from "./flex-slider-card-slider";
import { FlexSliderCardValuesBar } from "./flex-slider-card-valuesbar";

export class FlexSliderCard extends HTMLElement {
  
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
  
  setConfig(config) {
    debuglog("setConfig");
    try {
      this._config = new FlexSliderCardConfigMngr(config);
    } catch (error) {
      this._toErrorState(error);
    }
  }
  
  connectedCallback() {
    debuglog("connectedCallback");
    this._toConnectedState();
  }
  
  disconnectedCallback() {
    debuglog("disconnectedCallback");
    this._toDisconnectedState();
  }
  
  set hass(hass) {
    debuglog("hass");
    if (this._config) {
      this._config.update(hass);
      if (this._state == FlexSliderCard._State.CONNECTED) {
        this._toOperState();
      }
    }
    if (this._state == FlexSliderCard._State.OPER) {
      this._Oper();
    }
  }

  getCardSize() {
    if (this._config.isStd()) {
      return 2;
    } else if (this._config.isCompact()) {
      return 1;
    } else {
          throw new Error("Invalid format in getCardSize");
    }
  }

  getGridOptions() {
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

  _initPrivateConfig() {        // parameters initialized by constructor
    this._config = null;         // user configuration object
  }
  
  _initPrivateDisplayData() {                           //parameters initialized by the constructor or when the card is disconnected
    debuglog("DISCONNECTED");
    this._userIsUpdating = false;                       //true when user is currently dragging the slider, false otherwise
    this._slider = null;                                // reference to the noUiSlider instance
    this._updateHtmlElementInProgress = false;        // true when _updateValuesDisplay is currently running, false otherwise
    this._updateHtmlElementRequestPending = false;    // true if a call to _updateValuesDisplay was requested while it was already running, false otherwise
    this._sliderHtmlElement = null;                         // reference to the DOM element in which the slider is created
  }

  /****************************************************/
  /* Utilities                                        */
  /****************************************************/

  /****************************************************/
  /* State Management                                 */
  /****************************************************/

  static _State = Object.freeze({
    DISCONNECTED: 0,
    CONNECTED: 1,
    OPER: 2,
    IDLE: 3,
    ERROR: 4
  });
  
  _toDisconnectedState() {
    if (this._slider) {
      this._slider.destroy();
    }
    this._initPrivateDisplayData();
    this._state = FlexSliderCard._State.DISCONNECTED;   // current state of the card is DISCONNECTED
  }

  _toConnectedState() {
    if (this._state == FlexSliderCard._State.DISCONNECTED) {
      this._state = FlexSliderCard._State.CONNECTED;
      debuglog("CONNECTED");
    } else {
      debuglog("Unexpected state when connecting: "+this._state);
      throw new Error("Unexpected state when connecting: "+this._state);
    }
  }

  _toErrorState(error) {
    this._state = FlexSliderCard._State.ERROR;
    debuglog("ERROR");
    throw new Error(error.message);
  } 
  _toIdleState() {
    this._state = FlexSliderCard._State.IDLE;
    debuglog("IDLE");
  }

  _toOperState() {
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
    this._state = FlexSliderCard._State.OPER;
  }

  _Oper() {
    this._updateHtmlElement();
  }

  /****************************************************/
  /* HTML Management                                  */
  /****************************************************/

  _createHtmlElement() {
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
      const valuesBar = new FlexSliderCardValuesBar(this._config, this.shadowRoot.querySelector(".values"));
      this._config.valuesBar = valuesBar;
    }    
    
    this._sliderHtmlElement = this.shadowRoot.getElementById("slider");
    return true;
  }
  
  _updateHtmlElement() {
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

  _initSlider() {
    if (this._slider) return;
    const min = this._config.entities.min.sliderValue;
    const max = this._config.entities.max.sliderValue;
    this._slider = new FlexSliderCardSlider(this._config, min, max, this._sliderHtmlElement);
    this._config.entitiesSetBaseline();
  }
  
}

customElements.define('flex-slider-card', FlexSliderCard);