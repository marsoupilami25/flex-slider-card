import { timeToMinutes, minutesToTime } from "./utils/utils";
import { HomeAssistant } from "custom-card-helpers";
import { FlexSliderCardConfigMngr } from "./config/flex-slider-card-config";

export enum FlexSliderCardEntityType {
  NUMBER = "number",
  TIME = "time"
}

export enum FlexSliderCardDataType {
  VALUE = "value",
  TIME = "time"
}

export type FlexSliderCardValueType = number | string;

type FlexSliderCardService = "set_value" | "set_datetime";
type FlexSliderEntityDomain = "number" | "input_number" | "input_datetime";

export class FlexSliderCardEntity {
  
  private _suffix: string;
  private _domain: FlexSliderEntityDomain;
  private _entitytype: FlexSliderCardEntityType;
  private _service: FlexSliderCardService;
  private _entityid: string;
  private _baselineValue: number | undefined = undefined;
  private _callService: HomeAssistant["callService"] | null = null;
  private _states: HomeAssistant["states"] | null = null;
  private _datatype: FlexSliderCardDataType;

  constructor(config: FlexSliderCardConfigMngr, suffix: string) {
    this._suffix = suffix;
    this._entityid = config.getEntityConfig(suffix);
    this._domain = this._entityid.split(".")[0] as FlexSliderEntityDomain;
    switch (this._domain) {
      case "number":
      case "input_number":
        this._entitytype = FlexSliderCardEntityType.NUMBER;
        this._datatype = FlexSliderCardDataType.VALUE;
        this._service = "set_value";
        break;
      case "input_datetime":
        this._entitytype = FlexSliderCardEntityType.TIME;
        this._datatype = FlexSliderCardDataType.TIME;
        this._service = "set_datetime";
        break;
      default:
        throw new Error(`Unexpected 'entity_${suffix}' domain`);
    }
    this.resetBaseline();
  }

  public update(hass: HomeAssistant): void {
    this._callService = hass.callService;
    this._states = hass.states;
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

  public get sliderValue(): number {
    if (!this._states) {
      throw new Error("Hass states not initialized");
    }
    const state = this._states[this.entityId];
    if (!state) {
      throw new Error(`Entity '${this.entityId}' not found`);
    }
    return this._fromEntity(state.state);
  }

  public exists(): boolean {
    return !!this._states?.[this.entityId];
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
  
  private _toEntity(sliderValue: number): FlexSliderCardValueType {
    if (this._entitytype === FlexSliderCardEntityType.NUMBER) {
      return Number(sliderValue);
    }
    if (this._entitytype === FlexSliderCardEntityType.TIME) {
      return minutesToTime(sliderValue);
    }
    throw new Error(`Unexpected entity type '${this._entitytype}'`);
  }

  private _fromEntity(entityValue: FlexSliderCardValueType): number {
    if (this._entitytype === FlexSliderCardEntityType.NUMBER) {
      return Number(entityValue);
    }
    if (this._entitytype === FlexSliderCardEntityType.TIME) {
      return timeToMinutes(String(entityValue));
    }
    throw new Error(`Unexpected entity type '${this._entitytype}'`);
  }

}