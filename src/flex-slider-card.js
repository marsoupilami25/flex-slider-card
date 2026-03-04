import noUiSlider from "nouislider";
import { stdFlexSliderCardCss } from "./std-flex-slider-css.js"
import { compactFlexSliderCardCss } from "./compact-flex-slider-css.js"

export class FlexSliderCard extends HTMLElement {
  
  static State = Object.freeze({
    DISCONNECTED: 0,
    CONNECTED: 1,
    INIT: 2,
    OPER: 3,
    ERROR: 4
  });
  
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._initPrivateConfig();
    this._initPrivateDisplayData();
    this._debuglog("constructor");
  }
  
  setConfig(config) {
    this._debuglog("setConfig");
    if (!config.entity_min || !config.entity_max) {
      this._state = FlexSliderCard.State.ERROR;
      throw new Error("You need to define 'entity_min' and 'entity_max'");
    }
    this._mindomain = config.entity_min.split(".")[0];
    switch (this._mindomain) {
      case "number":
      case "input_number":
        this._entitytype = "number";
        this._minservice = "set_value";
        break;
      case "input_datetime":
        this._entitytype = "time";
        this._minservice = "set_datetime";
        break;
      default:
        throw new Error("Unexpected 'entity_min' domain");
    }
    this._maxdomain = config.entity_max.split(".")[0];
    switch (this._maxdomain) {
      case "number":
      case "input_number":
        if (this._entitytype != "number") {
          throw new Error("'entity_min' and 'entity_max' shall have compatible domains");
        }
        this._maxservice = "set_value";
        break;
      case "input_datetime":
        if (this._entitytype != "time") {
          throw new Error("'entity_min' and 'entity_max' shall have compatible domains");
        }
        this._maxservice = "set_datetime";
        break;
      default:
        throw new Error("Unexpected 'entity_max' domain");
    }
    this.config = config;
  }
  
  connectedCallback() {
    this._debuglog("connectedCallback");
    if (this._state == FlexSliderCard.State.DISCONNECTED) {
      this._state = FlexSliderCard.State.CONNECTED;
      this._debuglog("CONNECTED");
    }
  }
  
  disconnectedCallback() {
    this._debuglog("disconnectedCallback");
    if (this._slider) {
      this._slider.destroy();
    }
    this._initPrivateDisplayData();
  }
  
  set hass(hass) {
    this._debuglog("hass");
    this._hass = hass;
    if (this._state == FlexSliderCard.State.CONNECTED && this.config) {
      this._init();
    }
    if (this._state == FlexSliderCard.State.OPER) {
      this._updateValuesDisplay();
    }
  }
  
  _debuglog(text) {
    if (this._activeDebug) console.log(text);
  }
  
  _initPrivateConfig() {
    this._mindomain = null;
    this._minservice = null;
    this._maxdomain = null;
    this._maxservice = null;
    this._entitytype = null;
    this.config = null;
  }
  
  _initPrivateDisplayData() {
    this._activeDebug = false;
    this._debuglog("DISCONNECTED");
    this._state = FlexSliderCard.State.DISCONNECTED;
    this._userIsUpdating = false;
    this._slider = null;
    this._updateValuesDisplayInProgress = false;
    this._updateValuesDisplayRequestPending = false;
    this._sliderElement = null;
    this._lastmin = null;
    this._lastmax = null;
  }
  
  _init() {
    this._state = FlexSliderCard.State.INIT;
    this._debuglog("INIT");
    if (this._create()) {
      this._updateValuesDisplay();
    } else {
      this._state = FlexSliderCard.State.ERROR;
      this._debuglog("ERROR");
    }
  }
  
  _renderTemplate(name) {
    const {
      format = "std"
    } = this.config;
    let css = '';

    switch (format) {
      case "std":
        css = stdFlexSliderCardCss;
        break;
      case "compact":
        css = compactFlexSliderCardCss;
        break;
      default:
        throw new Error("Invalid format '"+format+"'");
    }

    this.shadowRoot.innerHTML = `
      <style>
        ${css}
      </style>

      <div class="container">
        <div class="title">${name}</div>

        <div class="slider-container">
          <div class="slider" id="slider"></div>

          <div class="values">
            <span id="min-value"></span>
            <span id="max-value"></span>
          </div>
        </div>
      </div>
    `;
  }
  
  _timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }
  
  _minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
    const mins = (minutes % 60).toString().padStart(2, "0");
    return `${hours}:${mins}`;
  }
  
  _entityToSlider(value) {
    if (this._entitytype == "number") {
      return Number(value);
    }
    if (this._entitytype == "time") {
      return this._timeToMinutes(value);
    }
  }
  
  _sliderToDisplay(value) {
    if (this._entitytype == "number") {
      return Number(value).toFixed(1);
    }
    if (this._entitytype == "time") {
      return this._minutesToTime(value);
    }
  }
  
  _sliderToEntity(value) {
    if (this._entitytype == "number") {
      return Number(value);
    }
    if (this._entitytype == "time") {
      return this._minutesToTime(value);
    }
  }
  
  _create() {
    const {
      entity_min,
      entity_max,
      name = "Range Slider"
    } = this.config;
    const stateMin = this._hass.states[entity_min];
    const stateMax = this._hass.states[entity_max];
    if (!stateMin || !stateMax) {
      this.shadowRoot.innerHTML = `<p>Entities not found</p>`;
      return false;
    }
    this._renderTemplate(name);
    this._sliderElement = this.shadowRoot.getElementById("slider");
    return true;
  }
  
  _updateValuesDisplay() {
    if (this._updateValuesDisplayInProgress) {
      this._updateValuesDisplayRequestPending = true;
      return;
    }
    this._updateValuesDisplayInProgress = true;
    try {
      if (this._userIsUpdating) {
        return;
      }
      const { entity_min, entity_max, unit = "" } = this.config;
      const minState = this._hass.states[entity_min];
      const maxState = this._hass.states[entity_max];
      if (!minState || !maxState) return;
      const minValue = this._entityToSlider(minState.state);
      const maxValue = this._entityToSlider(maxState.state);
      if (!this._slider) {
        this._initSlider(minValue, maxValue);
        this._lastmin = minValue;
        this._lastmax = maxValue;
      } else {
        if (minValue != this._lastmin || maxValue != this._lastmax) {
          this._slider.set([minValue, maxValue], false);
          this._lastmin = minValue;
          this._lastmax = maxValue;
        }
      }
    } finally {
      this._updateValuesDisplayInProgress = false;
      if (this._updateValuesDisplayRequestPending) {
        this._updateValuesDisplayRequestPending = false;
        queueMicrotask(() => this._updateValuesDisplay());
      }
    }
    if (this._state != FlexSliderCard.State.OPER) {
      this._state = FlexSliderCard.State.OPER;
      this._debuglog("OPER");
    }
    return;
  }
  
  _initSlider(minAtInit, maxAtInit) {
    if (this._slider) return;
    let {
      min = 0,
      max = 100,
      step = 1
    } = this.config;
    if (this._entitytype == "time") {
      min = 0;
      max = 1439;
      step = Math.round(step);
    }
    noUiSlider.create(this._sliderElement, {
      start: [minAtInit, maxAtInit],
      connect: true,
      range: {
        min,
        max
      },
      step
    });
    this._slider = this._sliderElement.noUiSlider;
    this._slider.on("start", () => {
      this._debuglog("start");
      this._userIsUpdating = true;
    });
    this._slider.on("change", (values) => {
      this._debuglog("change");
      this._userIsUpdating = false;
      this._setEntities(values);
    });
    this._slider.on("update", (values) => {
      this._debuglog("update");
      const { unit = "" } = this.config;
      const minVal = this._sliderToDisplay(values[0]);
      const maxVal = this._sliderToDisplay(values[1]);
      const minElement = this.shadowRoot.getElementById("min-value");
      const maxElement = this.shadowRoot.getElementById("max-value");
      minElement.textContent = `Min: ${minVal}${unit}`;
      maxElement.textContent = `Max: ${maxVal}${unit}`;
    });
    this._slider.on("end", () => {
      this._debuglog("end");
      this._userIsUpdating = false;
    });
  }
  
  _setEntities(values) {
    const { entity_min, entity_max } = this.config;
    const min = this._sliderToEntity(values[0]);
    const max = this._sliderToEntity(values[1]);
    const key=(this._entitytype==='time'?'time':'value');
    this._hass.callService(this._mindomain, this._minservice, {
      entity_id: entity_min,
      [key]: min
    });
    this._hass.callService(this._maxdomain, this._maxservice, {
      entity_id: entity_max,
      [key]: max
    });
  }

  getCardSize() {
    const {
      format = "std"
    } = this.config;

    switch (format) {
      case "std":
        return 2;
      case "compact":
        return 1;
      default:
        throw new Error("Invalid format '"+format+"'");
    }
    return 2;
  }

  getGridOptions() {
    const {
      format = "std"
    } = this.config;

    switch (format) {
      case "std":
        return {
          min_rows: 2,
          min_columns: 6,
          max_columns: 12
        };
      case "compact":
        return {
          min_rows: 1,
          min_columns: 2,
          max_columns: 6
        };
      default:
        throw new Error("Invalid format '"+format+"'");
    }
  }
}

customElements.define('flex-slider-card', FlexSliderCard);