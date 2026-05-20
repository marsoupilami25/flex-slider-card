import { timeToMinutes, minutesToTime } from "./utils/utils";
import { HomeAssistant } from "custom-card-helpers";
import {
  FlexSliderCardEntityType,
  FlexSliderEntityDomain,
  getEntityDomain,
  getEntityType,
  isNumericEntityType,
} from "./utils/entity-management";

export enum FlexSliderCardDataType {
  VALUE = "value",
  TIME = "time",
  POSITION = "position"
}

export type FlexSliderCardValueType = number | string;
type FlexSliderCardState = HomeAssistant["states"][string];

type FlexSliderCardService = "set_value" | "set_datetime" | "set_cover_position";

export class FlexSliderCardEntity {
  
  private _domain!: FlexSliderEntityDomain;
  private _entitytype!: FlexSliderCardEntityType;
  private _service!: FlexSliderCardService;
  private _entityid!: string;
  private _text!: string;
  private _baselineValue: number | undefined = undefined;
  private _callService: HomeAssistant["callService"] | null = null;
  private _state: FlexSliderCardState | undefined;
  private _datatype!: FlexSliderCardDataType;

  constructor(entityId: string, text = "") {
    this._entityid = entityId;
    this._text = text;
    this._domain = getEntityDomain(this._entityid);
    this._entitytype = getEntityType(this._entityid);
    switch (this._entitytype) {
      case FlexSliderCardEntityType.NUMBER:
        this._datatype = FlexSliderCardDataType.VALUE;
        this._service = "set_value";
        break;
      case FlexSliderCardEntityType.TIME:
        this._datatype = FlexSliderCardDataType.TIME;
        this._service = "set_datetime";
        break;
      case FlexSliderCardEntityType.COVER:
        this._datatype = FlexSliderCardDataType.POSITION;
        this._service = "set_cover_position";
        break;
      default:
        throw new Error(`Unexpected entity domain for '${this._entityid}'`);
    }
    this.resetBaseline();
  }

  public update(hass: HomeAssistant): void {
    this._callService = hass.callService;
    this._state = hass.states[this.entityId];
    if (this._state) {
      this._assertSupportedInputDatetimeState(this._state);
    }
  }

  /****************************************************/
  /* Getters                                          */
  /****************************************************/

  public get domain(): FlexSliderEntityDomain {
    return this._domain;
  }

  public get service(): FlexSliderCardService {
    return this._service;
  }

  public get entitytype(): FlexSliderCardEntityType {
    return this._entitytype;
  }

  public get entityId(): string {
    return this._entityid;
  }

  public get datatype(): FlexSliderCardDataType {
    return this._datatype
  }

  public toText(sliderValue: number, nbdigits: number, unit = "", showText = true): string {
    const value = this.toDisplay(sliderValue, nbdigits);

    return showText && this._text ? `${this._text}: ${value}${unit}` : `${value}${unit}`;
  }

  public toDisplay(sliderValue: number, nbdigits: number): string {
    if (isNumericEntityType(this._entitytype)) {
      return Number(sliderValue).toFixed(nbdigits);
    }
    if (this._entitytype === FlexSliderCardEntityType.TIME) {
      return minutesToTime(sliderValue);
    }
    throw new Error(`Unexpected entity type '${this._entitytype}'`);
  }

  public get sliderValue(): number {
    const state = this._getState();
    return this._fromEntity(this._getStateValue(state));
  }

  public exists(): boolean {
    return this._state !== undefined;
  }

  /****************************************************/
  /* Setters                                          */
  /****************************************************/

  public async setSliderValue(newSliderValue: number): Promise<void> {
    const havalue: FlexSliderCardValueType = this._toEntity(newSliderValue);
    if (!this._callService) {
      throw new Error("Hass callService not initialized");
    }
    await this._callService(this.domain, this.service, {
      entity_id: this.entityId,
      [this.datatype]: havalue
    });
  }

  /****************************************************/
  /* baseline                                         */
  /****************************************************/

  public resetBaseline(): void {
    this._baselineValue = undefined;
  }

  public getBaseline(): number | undefined {
    return this._baselineValue;
  }

  public setBaseline(): void {
    this._baselineValue = this.sliderValue;
  }

  public isUpdated(): boolean {
    return this.sliderValue !== this._baselineValue;
  }

  /****************************************************/
  /* Utilities                                        */
  /****************************************************/

  private _getState(): FlexSliderCardState {
    if (!this._state) {
      throw new Error(`Entity '${this.entityId}' not found`);
    }
    return this._state;
  }

  private _assertSupportedInputDatetimeState(state: FlexSliderCardState): void {
    if (this._domain !== "input_datetime") {
      return;
    }

    const hasDate = state.attributes.has_date === true;
    const hasTime = state.attributes.has_time === true;

    if (hasTime && !hasDate) {
      return;
    }

    throw new Error(
      `Entity '${this.entityId}' must be a time-only input_datetime ` +
      `(has_time: true, has_date: false); got has_time: ${String(state.attributes.has_time)}, ` +
      `has_date: ${String(state.attributes.has_date)}`
    );
  }

  private _getStateValue(state: FlexSliderCardState): FlexSliderCardValueType {
    if (this._entitytype === FlexSliderCardEntityType.COVER) {
      return state.attributes.current_position as FlexSliderCardValueType;
    }

    return state.state;
  }
  
  private _toEntity(sliderValue: number): FlexSliderCardValueType {
    if (isNumericEntityType(this._entitytype)) {
      return Number(sliderValue);
    }
    if (this._entitytype === FlexSliderCardEntityType.TIME) {
      return minutesToTime(sliderValue);
    }
    throw new Error(`Unexpected entity type '${this._entitytype}'`);
  }

  private _fromEntity(entityValue: FlexSliderCardValueType): number {
    if (isNumericEntityType(this._entitytype)) {
      return Number(entityValue);
    }
    if (this._entitytype === FlexSliderCardEntityType.TIME) {
      return timeToMinutes(String(entityValue));
    }
    throw new Error(`Unexpected entity type '${this._entitytype}'`);
  }

}
