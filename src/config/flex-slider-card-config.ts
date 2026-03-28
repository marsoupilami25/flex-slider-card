import { HomeAssistant } from "custom-card-helpers";
import { FlexSliderCardEntity, FlexSliderCardEntityType } from "../flex-slider-card-entity";
import { FlexSliderCardFormat, 
  FlexSliderCardDigits, 
  FlexSliderCardConfig, 
  assertFlexSliderCardFormat, 
  assertFlexSliderCardDigits} from "./flex-slider-card-config-type";
import { FlexSliderCardValuesBar } from "../flex-slider-card-valuesbar";
import { assertOptionalString,
  assertOptionalNumber,
assertOptionalBoolean } from "../utils/utils";

export class FlexSliderCardConfigMngr  {
  
  private _config: FlexSliderCardConfig;
  private _entities: { [suffix: string]: FlexSliderCardEntity };
  private _entitytype?: FlexSliderCardEntityType;
  private _valuesBar!: FlexSliderCardValuesBar | undefined;

  constructor(config: FlexSliderCardConfig) {
    this._config = structuredClone(config);      // user configuration object
    this._entities = {};        // entities objects, with suffix as key ("min" and "max")
    this._entitytype = undefined;    // entity type: "number" or "time", depending on the domains of entity_min and entity_max

    this._checkFormat();
    this._checkTitle();
    this._checkEntities(); //warning: need to be call before _checkSlider because it needs to know the entity type
    this._checkSlider(); //warning: need to be call before _checkValuesBar because it sets default values for min, max and step
    this._checkValuesBar();
  }

  public update(hass: HomeAssistant): void {
    this._updateFormat(hass);
    this._updateTitle(hass);
    this._updateEntities(hass); 
    this._updateSlider(hass);
    this._updateValuesBar(hass);
  }

  public reset(): void {
    this._resetFormat();
    this._resetTitle();
    this._resetEntities(); 
    this._resetSlider(); 
    this._resetValuesBar();
  }

  /****************************************************/
  /* format                                           */
  /****************************************************/

  protected _checkFormat(): void {
    if (this._config.format === undefined) {
      this._config.format = "std";
    }
    assertFlexSliderCardFormat(this._config.format);
  }

  protected _updateFormat(hass: HomeAssistant): void {}

  protected _resetFormat(): void {}

  public isCompact(): boolean {
    return this._config.format === "compact";
  }

  public isStd(): boolean {
    return this._config.format === "std";
  }

  /****************************************************/
  /* title                                            */
  /****************************************************/

  protected _checkTitle(): void {
    assertOptionalString(this._config.name, "name");
    if (this._config.name == undefined) {
      this._config.name = undefined;
    }
  }

  protected _updateTitle(hass: HomeAssistant): void {}

  protected _resetTitle(): void {}

  public hasTitle(): boolean {
    return this._config.name !== undefined;
  }

  public get title(): string {
    return this._config.name || "";
  }

  /****************************************************/
  /* values bar                                       */
  /****************************************************/

  protected _checkValuesBar(): void {
    assertOptionalBoolean(this._config.valuesbar, "valuesbar");
    if (this._config.valuesbar == undefined) {
      this._config.valuesbar = false;
    }

    if (this._config.digits == undefined) {
      this._config.digits = "auto";
    }
    assertFlexSliderCardDigits(this._config.digits);
    if (this._config.digits === "auto") {
      this._config.digits = this.step.toString().split(".")[1]?.length || 0; //_checkSlider should have been called before and set a default value for step if it was not defined by the user
    }

    if (this._config.unit == undefined) {
      this._config.unit = "";
    }

    assertOptionalString(this._config.mintext, "mintext");
    if (this._config.mintext == undefined) {
      this._config.mintext = "";
    }
    if (this._config.mintext !== "") {
      this._config.mintext = this._config.mintext + ": ";
    }

    assertOptionalString(this._config.maxtext, "maxtext");
    if (this._config.maxtext == undefined) {
      this._config.maxtext = "";
    }
    if (this._config.maxtext == undefined) {
      this._config.maxtext = "";
    }
    if (this._config.maxtext !== "") {
      this._config.maxtext = this._config.maxtext + ": ";
    }

    this._valuesBar = undefined; // reference to the values bar object, if it is created
  }

  protected _updateValuesBar(hass: HomeAssistant): void {}

  protected _resetValuesBar(): void {}

  public hasValuesBar(): boolean {
    return (this._config.valuesbar === true);
  }

  public set valuesBar(valuesBar: FlexSliderCardValuesBar | undefined) {
    this._valuesBar = valuesBar;
  }

  public get valuesBar(): FlexSliderCardValuesBar | undefined {
    return this._valuesBar;
  }
  
  public get digits(): FlexSliderCardDigits {
    if (this._config.digits === undefined) {
      throw new Error("Digits is not defined in config");
    }
    return this._config.digits;
  }

  public get unit(): string {
    if (this._config.unit === undefined) {
      throw new Error("Unit is not defined in config");
    }
    return this._config.unit;
  }

  public get mintext(): string {
    if (this._config.mintext === undefined) {
      throw new Error("Min text is not defined in config");
    }
    return this._config.mintext;
  }

  public get maxtext(): string {
    if (this._config.maxtext === undefined) {
      throw new Error("Max text is not defined in config");
    }
    return this._config.maxtext;
  }

  /****************************************************/
  /* slider                                           */
  /****************************************************/

  protected _checkSlider(): void {
    assertOptionalNumber(this._config.min, "min");
    this._config.min ??= 0;

    assertOptionalNumber(this._config.max, "max");
    this._config.max ??= 100;

    assertOptionalNumber(this._config.step, "step");
    this._config.step ??= 1;

    if (this.entitytype === FlexSliderCardEntityType.TIME) {
      this._config.min = 0;
      this._config.max = 1439;
      this._config.step = Math.max(1, Math.round(this._config.step));
    }

    if (this._config.step <= 0) {
      throw new Error(`Invalid step '${this._config.step}', expected a number > 0`);
    }

    if (this._config.min > this._config.max) {
      throw new Error(`Invalid range: min (${this._config.min}) cannot be greater than max (${this._config.max})`);
    }
  }

  protected _updateSlider(hass: HomeAssistant): void {}

  protected _resetSlider(): void {}

  public get min(): number {
    return this._config.min!;
  }

  public get max(): number {
    return this._config.max!;
  }

  public get step(): number {
    return this._config.step!;
  }

  /****************************************************/
  /* entities                                         */
  /****************************************************/

  protected _isValidEntityId(entity: string): boolean {
    if (typeof entity !== "string") {
      return false;
    }

    const entityRegex = /^[a-z0-9_]+\.[a-z0-9_]+$/;

    return entityRegex.test(entity);
  }

  protected _checkEntities(): void {
    
    if (!this._config.entity_min || !this._config.entity_max) {
      throw new Error("You need to define 'entity_min' and 'entity_max'");
    }

    if (!this._isValidEntityId(this._config.entity_min)) {
      throw new Error("Invalid entity min format. Expected domain.object_id");
    }

    if (!this._isValidEntityId(this._config.entity_max)) {
      throw new Error("Invalid entity max format. Expected domain.object_id");
    }

    this._entities.min = new FlexSliderCardEntity(this, "min");
    this._entities.max = new FlexSliderCardEntity(this, "max");

    this._entitytype = this._entities.min.entitytype;
    if (this._entities.max.entitytype != this._entitytype) {
      throw new Error("'entity_min' and 'entity_max' shall have compatible domains");
    }

  }

  protected _updateEntities(hass: HomeAssistant): void {
    Object.values(this._entities).forEach(entity => entity.update(hass));
  }

  protected _resetEntities(): void {
    if (this.entitiesExist()) {
      this.entitiesResetBaseline();
    }
  }

  public getEntityConfig(suffix: string): string {
    return this._config[`entity_${suffix}`];
  }

  public get entitytype(): FlexSliderCardEntityType {
    if (this._entitytype === undefined) {
      throw new Error("Entity type is not defined in config");
    }
    return this._entitytype;
  }

  public get entities(): { [suffix: string]: FlexSliderCardEntity } {
    return this._entities;
  }

  public entitiesExist(): boolean {
    return Object.values(this._entities).every(entity => entity.exists());
  }

  public entitiesResetBaseline(): void {
    Object.values(this._entities).forEach(entity => entity.resetBaseline());
  }
  
  public entitiesSetBaseline(): void {
    Object.values(this._entities).forEach(entity => entity.setBaseline());
  }

  public entitiesIsUpdated(): boolean {
    return Object.values(this._entities).some(entity => entity.isUpdated());
  }

}