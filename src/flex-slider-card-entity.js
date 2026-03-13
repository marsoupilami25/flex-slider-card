import { timeToMinutes, minutesToTime } from "./utils";

export class FlexSliderCardEntity {
  
  static TYPE = Object.freeze({
    NUMBER: "number",
    TIME: "time"
  });

  constructor(config, suffix) {
    this._suffix = suffix;
    this._domain = config._getEntityConfig(suffix).split(".")[0];
    this._entityid = config._getEntityConfig(suffix);
    switch (this._domain) {
      case "number":
      case "input_number":
        this._entitytype = FlexSliderCardEntity.TYPE.NUMBER;
        this._service = "set_value";
        break;
      case "input_datetime":
        this._entitytype = FlexSliderCardEntity.TYPE.TIME;
        this._service = "set_datetime";
        break;
      default:
        throw new Error(`Unexpected 'entity_${suffix}' domain`);
    }
    this.resetBaseline();
  }

  update(hass) {
    this._callService = hass.callService;
    this._states = hass.states;
  }

  /****************************************************/
  /* Getters                                          */
  /****************************************************/

  get domain() {
    return this._domain;
  }

  get service() {
    return this._service;
  }

  get entitytype() {
    return this._entitytype;
  }

  get entityId() {
    return this._entityid;
  }

  get datatype() {
    switch(this._entitytype) {
      case FlexSliderCardEntity.TYPE.NUMBER:
        return "value";
      case FlexSliderCardEntity.TYPE.TIME:
        return "time";
      default:
        throw new Error(`Unexpected entity type '${this._entitytype}'`);
    }
  }

  get value() {
    if (!this._states) {
      throw new Error("Hass states not initialized");
    }
    let state = this._states[this.entityId];
    if (!state) {
      throw new Error(`Entity '${this.entityId}' not found`);
    }
    return this._fromEntity(state.state);
  }

  exists() {
    return !!this._states?.[this.entityId] ?? null;
  }

  /****************************************************/
  /* Setters                                          */
  /****************************************************/

  set value(newValue) {
    const havalue = this._toEntity(newValue);
    if (!this._callService) {
      throw new Error("Hass callService not initialized");
    }
    this._callService(this.domain, this.service, {
      entity_id: this.entityId,
      [this.datatype]: havalue
    });
  }

  /****************************************************/
  /* baseline                                         */
  /****************************************************/

  resetBaseline() {
    this._lastValue = null;
  }

  getBaseline() {
    return this._lastValue;
  }

  setBaseline() {
    this._lastValue = this.value;
  }

  isupdated() {
    return this.value != this._lastValue;
  }

  /****************************************************/
  /* Utilities                                        */
  /****************************************************/
  
  _toEntity(value) {
    if (this._entitytype == FlexSliderCardEntity.TYPE.NUMBER) {
      return Number(value);
    }
    if (this._entitytype == FlexSliderCardEntity.TYPE.TIME) {
      return minutesToTime(value);
    }
  }

  _fromEntity(value) {
    if (this._entitytype == FlexSliderCardEntity.TYPE.NUMBER) {
      return Number(value);
    }
    if (this._entitytype == FlexSliderCardEntity.TYPE.TIME) {
      return timeToMinutes(value);
    }
  }

}