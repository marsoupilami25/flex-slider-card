import { HomeAssistant } from "custom-card-helpers";
import { FlexSliderCardEntity } from "../flex-slider-card-entity";
import {
  FlexSliderCardConfig,
  assertFlexSliderCardFormat,
  assertFlexSliderCardDigits,
  assertFlexSliderCardDirection,
  FlexSliderCardDirection,
  assertFlexSliderCardHandlesBehavior,
  FlexSliderCardHandlesBehavior,
  assertFlexSliderCardOrientation,
  FlexSliderCardOrientation,
  assertFlexSliderCardVerticalLayout,
  FlexSliderCardVerticalLayout,
} from "./flex-slider-card-config-type";
import {
  assertOptionalString,
  assertOptionalNumber,
  assertOptionalBoolean
} from "../utils/utils";
import { FlexSliderCardEntityType, getEntityType, isValidEntityId } from "../utils/entity-management";
import {
  clearLegacyEntityTexts,
  getLegacyHandleText,
  hasLegacyBubblesTextConfig,
  hasEntityTextConflict,
  hasLegacyValuesBarTextConfig,
  setLegacyHandle,
} from "../utils/config-legacy-helpers";
import { validateConditionalConfig, type Condition } from "../conditional/flex-slider-card-validate-condition";

export class FlexSliderCardConfigMngr {

  private _config: FlexSliderCardConfig;
  private _entities: FlexSliderCardEntity[];
  private _referenceEntity?: FlexSliderCardEntity;
  private _entitytype?: FlexSliderCardEntityType;

  constructor(config: FlexSliderCardConfig) {
    this._config = structuredClone(config);      // user configuration object
    this._entities = [];        // entities objects ordered like handles in config.entities
    this._referenceEntity = undefined; // optional non-editable reference handle
    this._entitytype = undefined;    // entity type: "number", "time", or "cover", shared by all handles

    this._checkFormat();
    this._checkTitle();
    this._checkEntities(); //warning: need to be call before _checkSlider because it needs to know the entity type
    this._checkSlider(); //warning: need to be call before _checkValuesBar because it sets default values for min, max and step
    this._checkValuesBar();
    this._checkBubbles();
    this._checkTicks();
    this._checkReference();
    this._checkAdaptiveState();
  }

  public update(hass: HomeAssistant): void {
    this._updateFormat(hass);
    this._updateTitle(hass);
    this._updateEntities(hass);
    this._updateSlider(hass);
    this._updateValuesBar(hass);
    this._updateBubbles(hass);
    this._updateTicks(hass);
    this._updateReference(hass);
    this._updateAdaptiveState(hass);
  }

  public reset(): void {
    this._resetFormat();
    this._resetTitle();
    this._resetEntities();
    this._resetSlider();
    this._resetValuesBar();
    this._resetBubbles();
    this._resetTicks();
    this._resetReference();
    this._resetAdaptiveState();
  }

  public get config() : FlexSliderCardConfig {
    return this._config;
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

  protected _updateFormat(hass: HomeAssistant): void { }

  protected _resetFormat(): void { }

  public get isCompact(): boolean {
    return this._config.format === "compact";
  }

  public get isStd(): boolean {
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

  protected _updateTitle(hass: HomeAssistant): void { }

  protected _resetTitle(): void { }

  public get hasTitle(): boolean {
    return this._config.name !== undefined;
  }

  public get title(): string {
    return this._config.name || "";
  }

  /****************************************************/
  /* values bar                                       */
  /****************************************************/

  protected _checkValuesBar(): void {
    assertOptionalBoolean(this._config.valuesbaractive, "valuesbar");
    if (this._config.orientation === "vertical") {
      this._config.valuesbaractive = false;
    } else if (this._config.valuesbaractive == null) {
      this._config.valuesbaractive = false;
    }

    if (this._config.valuesbar == null) {
      this._config.valuesbar = {};
    }

    if (this._config.valuesbar.digits == null) {
      this._config.valuesbar.digits = "auto";
    }
    assertFlexSliderCardDigits(this._config.valuesbar.digits);

    if (this._config.valuesbar.digits === "auto") {
      this._config.valuesbar.nbdigits = this.step.toString().split(".")[1]?.length || 0; //_checkSlider should have been called before and set a default value for step if it was not defined by the user
    }
    if (this._config.valuesbar.nbdigits == null) {
      this._config.valuesbar.nbdigits = 0;
    }
    assertOptionalNumber(this._config.valuesbar.nbdigits, "nbdigits");
    if (this._config.valuesbar.nbdigits < 0) {
      throw new Error("nbdigits must be >= 0");
    }

    if (this._config.valuesbar.unit == null) {
      this._config.valuesbar.unit = "";
    }

    assertOptionalBoolean(this._config.valuesbar.showtext, "showtext");
    if (this._config.valuesbar.showtext == null) {
      this._config.valuesbar.showtext = false;
    }

  }

  protected _updateValuesBar(hass: HomeAssistant): void { }

  protected _resetValuesBar(): void { }

  public get hasValuesBar(): boolean {
    return (this._config.valuesbaractive === true);
  }

  public get nbdigitsValuesBar(): number {
    if (this._config.valuesbar?.nbdigits == null) {
      throw new Error("Digits is not defined in config");
    }
    return this._config.valuesbar.nbdigits;
  }

  public get unitValuesBar(): string {
    if (this._config.valuesbar?.unit == null) {
      throw new Error("Unit is not defined in config");
    }
    return this._config.valuesbar.unit;
  }

  public get showTextValuesBar(): boolean {
    if (this._config.valuesbar?.showtext == null) {
      throw new Error("Show text is not defined in config");
    }
    return this._config.valuesbar.showtext;
  }

  /****************************************************/
  /* bubbles                                          */
  /****************************************************/

  protected _checkBubbles(): void {
    assertOptionalBoolean(this._config.bubblesactive, "bubbles");
    if (this._config.bubblesactive == null) {
      this._config.bubblesactive = false;
    }

    if (this._config.bubbles == null) {
      this._config.bubbles = {};
    }

    if (this._config.bubbles.digits == null) {
      this._config.bubbles.digits = "auto";
    }
    assertFlexSliderCardDigits(this._config.bubbles.digits);

    if (this._config.bubbles.digits === "auto") {
      this._config.bubbles.nbdigits = this.step.toString().split(".")[1]?.length || 0; //_checkSlider should have been called before and set a default value for step if it was not defined by the user
    }
    if (this._config.bubbles.nbdigits == null) {
      this._config.bubbles.nbdigits = 0;
    }
    assertOptionalNumber(this._config.bubbles.nbdigits, "nbdigits");
    if (this._config.bubbles.nbdigits < 0) {
      throw new Error("nbdigits must be >= 0");
    }

    if (this._config.bubbles.unit == null) {
      this._config.bubbles.unit = "";
    }

    assertOptionalBoolean(this._config.bubbles.showtext, "showtext");
    if (this._config.bubbles.showtext == null) {
      this._config.bubbles.showtext = false;
    }

    assertOptionalBoolean(this._config.bubbles.dragonly, "dragonly");
    if (this._config.bubbles.dragonly == null) {
      this._config.bubbles.dragonly = false;
    }
  }

  protected _updateBubbles(hass: HomeAssistant): void { }

  protected _resetBubbles(): void { }

  public get hasBubbles(): boolean {
    return (this._config.bubblesactive === true);
  }

  public get nbdigitsBubbles(): number {
    if (this._config.bubbles?.nbdigits == null) {
      throw new Error("Digits is not defined in config");
    }
    return this._config.bubbles.nbdigits;
  }

  public get unitBubbles(): string {
    if (this._config.bubbles?.unit == null) {
      throw new Error("Unit is not defined in config");
    }
    return this._config.bubbles.unit;
  }

  public get showTextBubbles(): boolean {
    if (this._config.bubbles?.showtext == null) {
      throw new Error("Show text is not defined in config");
    }
    return this._config.bubbles.showtext;
  }

  public get isDragOnlyBubbles(): boolean {
    if (this._config.bubbles?.dragonly == null) {
      throw new Error("Drag only is not defined in config");
    }
    return this._config.bubbles.dragonly;   
  }
  
  /****************************************************/
  /* tick marks                                       */
  /****************************************************/

  protected _checkTicks(): void {
    assertOptionalBoolean(this._config.ticksactive, "ticks");
    if (this._config.ticksactive == null) {
      this._config.ticksactive = false;
    }

    if (this._config.ticks == null) {
      this._config.ticks = {};
    }

    if (this._config.ticks.digits == null) {
      this._config.ticks.digits = "auto";
    }
    assertFlexSliderCardDigits(this._config.ticks.digits);

    if (this._config.ticks.digits === "auto") {
      this._config.ticks.nbdigits = this.step.toString().split(".")[1]?.length || 0;
    }
    if (this._config.ticks.nbdigits == null) {
      this._config.ticks.nbdigits = 0;
    }
    assertOptionalNumber(this._config.ticks.nbdigits, "nbdigits");
    if (this._config.ticks.nbdigits < 0) {
      throw new Error("nbdigits must be >= 0");
    }

    assertOptionalNumber(this._config.ticks.majorticks, "majorticks");
    if (this._config.ticks.majorticks == null) {
      this._config.ticks.majorticks = 4;
    }
    if (this._config.ticks.majorticks < 2) {
      throw new Error("majorticks must be >= 2");
    }

    assertOptionalNumber(this._config.ticks.minorticks, "minorticks");
    if (this._config.ticks.minorticks == null) {
      this._config.ticks.minorticks = 0;
    }
    if (this._config.ticks.minorticks < 0) {
      throw new Error("minorticks must be >= 0");
    }
  }

  protected _updateTicks(hass: HomeAssistant): void { }

  protected _resetTicks(): void { }

  public get hasTicks(): boolean {
    return (this._config.ticksactive === true);
  }

  public get nbdigitsTicks(): number {
    if (this._config.ticks?.nbdigits == null) {
      throw new Error("Digits is not defined in config");
    }
    return this._config.ticks.nbdigits;
  }
  
  public get majorticks(): number {
    if (this._config.ticks?.majorticks == null) {
      throw new Error("Major ticks is not defined in config");
    }
    return this._config.ticks.majorticks;
  }
  
  public get minorticks(): number {
    if (this._config.ticks?.minorticks == null) {
      throw new Error("Minor ticks is not defined in config");
    }
    return this._config.ticks.minorticks;
  }

  /****************************************************/
  /* reference entity                                 */
  /****************************************************/

  protected _checkReference(): void {
    assertOptionalBoolean(this._config.referenceactive, "reference");
    if (this._config.referenceactive == null) {
      this._config.referenceactive = false;
    }

    if (this._config.reference == null) {
      this._config.reference = {};
    }

    this._referenceEntity = undefined;

    assertOptionalString(this._config.reference.entity, "reference.entity");
    assertOptionalString(this._config.reference.text, "reference.text");
    assertOptionalString(this._config.reference.unit, "reference.unit");
    assertOptionalBoolean(this._config.reference.bubble, "reference.bubble");
    assertOptionalBoolean(this._config.reference.valuesbar, "reference.valuesbar");
    assertOptionalBoolean(this._config.reference.valuesbartextlarge, "reference.valuesbartextlarge");
    if (this._config.reference.unit == null) {
      this._config.reference.unit = undefined;
    }
    if (this._config.reference.bubble == null) {
      this._config.reference.bubble = false;
    }
    if (this._config.orientation === "vertical") {
      this._config.reference.valuesbar = false;
    } else if (this._config.reference.valuesbar == null) {
      this._config.reference.valuesbar = false;
    }
    if (this._config.reference.valuesbar !== true) {
      this._config.reference.valuesbartextlarge = false;
    } else if (this._config.reference.valuesbartextlarge == null) {
      this._config.reference.valuesbartextlarge = false;
    }
    if (this._config.valuesbaractive === true && this._config.reference.valuesbar === true) {
      throw new Error("Cannot use both entity values bar and reference values bar");
    }
    if (!this._config.reference.entity) {
      return;
    }

    if (!isValidEntityId(this._config.reference.entity)) {
      throw new Error("Invalid format for reference entity. Expected domain.object_id");
    }

    if (getEntityType(this._config.reference.entity) !== this.entitytype) {
      const expectedDomains = this.entitytype === FlexSliderCardEntityType.TIME
        ? "input_datetime"
        : this.entitytype === FlexSliderCardEntityType.COVER
          ? "cover"
        : "number or input_number";
      throw new Error(`Reference entity must use compatible domains. Expected: ${expectedDomains}`);
    }

    this._referenceEntity = new FlexSliderCardEntity(
      this._config.reference.entity,
      this._config.reference.text ?? ""
    );
  }

  protected _updateReference(hass: HomeAssistant): void {
    this._referenceEntity?.update(hass);
  }

  protected _resetReference(): void {
    this._referenceEntity?.resetBaseline();
  }

  public get hasReferenceBubble(): boolean {
    return this.hasReference && this._config.reference?.bubble === true;
  }

  public get hasReferenceValuesBar(): boolean {
    return this.hasReference && this._config.reference?.valuesbar === true;
  }

  public get hasReferenceValuesBarTextLarge(): boolean {
    return this.hasReferenceValuesBar && this._config.reference?.valuesbartextlarge === true;
  }

  public get referenceUnit(): string {
    return this._config.reference?.unit ?? "";
  }

  /****************************************************/
  /* adaptive state                                   */
  /****************************************************/

  protected _checkAdaptiveState(): void {
    assertOptionalBoolean(this._config.adaptivestateactive, "adaptivestateactive");
    if (this._config.adaptivestateactive == null) {
      this._config.adaptivestateactive = false;
    }

    if (this._config.adaptivestate == null) {
      this._config.adaptivestate = {};
    }

    if (this._config.adaptivestate.conditions == null) {
      this._config.adaptivestate.conditions = [];
    }
    if (!Array.isArray(this._config.adaptivestate.conditions)) {
      throw new Error("adaptivestate.conditions must be an array");
    }
    if (!validateConditionalConfig(this._config.adaptivestate.conditions)) {
      throw new Error("Invalid adaptive state conditions");
    }

    assertOptionalBoolean(
      this._config.adaptivestate.editablewhenlinkedinactive,
      "adaptivestate.editablewhenlinkedinactive",
    );
    if (this._config.adaptivestate.editablewhenlinkedinactive == null) {
      this._config.adaptivestate.editablewhenlinkedinactive = false;
    }
  }

  protected _updateAdaptiveState(hass: HomeAssistant): void { }

  protected _resetAdaptiveState(): void { }

  public get isAdaptative(): boolean {
    return this._config.adaptivestateactive === true;
  }

  public get adaptiveStateConditions(): Condition[] {
    if (this._config.adaptivestate?.conditions == null) {
      throw new Error("Adaptive state conditions are not defined in config");
    }
    return this._config.adaptivestate.conditions;
  }

  public get isEditableWhenLinkedInactive(): boolean {
    if (this._config.adaptivestate?.editablewhenlinkedinactive == null) {
      throw new Error("Editable when linked inactive state is not defined in config");
    }
    return this._config.adaptivestate.editablewhenlinkedinactive;
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
    if (this.entitytype === FlexSliderCardEntityType.COVER) {
      if (this._config.min < 0 || this._config.min > 100) {
        throw new Error(`Invalid cover range: min (${this._config.min}) must be between 0 and 100`);
      }
      if (this._config.max < 0 || this._config.max > 100) {
        throw new Error(`Invalid cover range: max (${this._config.max}) must be between 0 and 100`);
      }
    }

    if (this._config.step <= 0) {
      throw new Error(`Invalid step '${this._config.step}', expected a number > 0`);
    }

    if (this._config.min > this._config.max) {
      throw new Error(`Invalid range: min (${this._config.min}) cannot be greater than max (${this._config.max})`);
    }

    if (this._config.direction == null) {
      this._config.direction = "ltr";
    }
    assertFlexSliderCardDirection(this._config.direction);

    if (this._config.orientation == null) {
      this._config.orientation = "horizontal";
    }
    assertFlexSliderCardOrientation(this._config.orientation);

    if (this._config.verticallayout == null) {
      this._config.verticallayout = "standard";
    }
    assertFlexSliderCardVerticalLayout(this._config.verticallayout);

    if (this._config.handlesbehavior == null) {
      this._config.handlesbehavior = "fixed";
    }
    assertFlexSliderCardHandlesBehavior(this._config.handlesbehavior);

    if (this._config.orientation === "horizontal") {
      assertOptionalNumber(this._config.horizontalwidth, "horizontalwidth");
      this._config.horizontalwidth ??= 90;
      if (this._config.horizontalwidth < 10 || this._config.horizontalwidth > 100) {
        throw new Error("horizontalwidth must be between 10 and 100");
      }
      this._config.verticalheight = undefined;
    } else {
      this._config.horizontalwidth = undefined;
      assertOptionalNumber(this._config.verticalheight, "verticalheight");
      if (this._config.verticalheight != null) {
        const minVerticalHeight = this.isCompact ? 1 : 2;
        if (this._config.verticalheight < minVerticalHeight || this._config.verticalheight > 12) {
          throw new Error(`verticalheight must be between ${minVerticalHeight} and 12`);
        }
      }
    }
  }

  protected _updateSlider(hass: HomeAssistant): void { }

  protected _resetSlider(): void { }

  public get min(): number {
    return this._config.min!;
  }

  public get max(): number {
    return this._config.max!;
  }

  public get step(): number {
    return this._config.step!;
  }

  public get direction(): FlexSliderCardDirection {
    if (this._config.direction == null) {
      throw new Error("Direction is not defined in config");
    }
    return this._config.direction;
  }

  public get orientation(): FlexSliderCardOrientation {
    if (this._config.orientation == null) {
      throw new Error("Orientation is not defined in config");
    }
    return this._config.orientation;
  }

  public get isVertical(): boolean {
    return this._config.orientation === "vertical";
  }

  public get verticalLayout(): FlexSliderCardVerticalLayout {
    if (this._config.verticallayout == null) {
      throw new Error("Vertical layout is not defined in config");
    }
    return this._config.verticallayout;
  }

  public get handlesBehavior(): FlexSliderCardHandlesBehavior {
    if (this._config.handlesbehavior == null) {
      throw new Error("Handles behavior is not defined in config");
    }
    return this._config.handlesbehavior;
  }

  public get gridRows(): number | string | undefined {
    return this._config.grid_options?.rows;
  }

  public get sliderHorizontalWidth(): number {
    if (this._config.horizontalwidth == null) {
      throw new Error("Size is not defined in config");
    }
    return this._config.horizontalwidth;
  }

  public get sliderVerticalHeight(): number | undefined {
    return this._config.verticalheight ?? undefined;
  }

  public get sliderVerticalHeightDefault(): number {
    return this.isCompact ? 1 : 2;
  }

  public get connect(): boolean[] {
    if (this.hasReference) {
      return [
        ...this._config.entities!.map((handleConfig) => handleConfig.connectprevious!),
        this._config.connectend!,
        false,
        false,
      ];
    }

    return [
      ...this._config.entities!.map((handleConfig) => handleConfig.connectprevious!),
      this._config.connectend!,
    ];
  }

  /****************************************************/
  /* entities                                         */
  /****************************************************/

  protected _checkEntities(): void {
    if (hasLegacyValuesBarTextConfig(this._config)) {
      const valuesbar = this._config.valuesbar;
      if (!valuesbar) {
        throw new Error("Legacy valuesbar text config requires valuesbar");
      }
      valuesbar.showtext = true;
    }

    if (hasLegacyBubblesTextConfig(this._config)) {
      const bubbles = this._config.bubbles;
      if (!bubbles) {
        throw new Error("Legacy bubbles text config requires bubbles");
      }
      bubbles.showtext = true;
    }

    const entities = Array.isArray(this._config.entities)
      ? this._config.entities.map((handleConfig) => ({
          entity: handleConfig?.entity ?? "",
          text: handleConfig?.text ?? "",
          connectprevious: handleConfig?.connectprevious,
        }))
      : [];

    assertOptionalBoolean(this._config.connectend, "connectend");
    if (this._config.connectend == null) {
      this._config.connectend = false;
    }

    // legacy entities configuration start
    if (this._config.entity_min !== undefined && this._config.entity_max === undefined) {
      throw new Error("Cannot use 'entity_min' without 'entity_max'");
    }

    if (this._config.entity_max !== undefined && this._config.entity_min === undefined) {
      throw new Error("Cannot use 'entity_max' without 'entity_min'");
    }

    if (this._config.entity_min !== undefined) {
      if (this._config.entities?.[0] !== undefined) {
        throw new Error("Cannot use both 'entity_min/entity_max' and 'entities'");
      }
      setLegacyHandle(entities, 0, { entity: this._config.entity_min });
    }

    if (this._config.entity_max !== undefined) {
      if (this._config.entities?.[1] !== undefined) {
        throw new Error("Cannot use both 'entity_min/entity_max' and 'entities'");
      }
      setLegacyHandle(entities, 1, { entity: this._config.entity_max });
    }

    if (hasEntityTextConflict(this._config)) {
      throw new Error("Cannot use both legacy 'mintext/maxtext' and 'entities[].text'");
    }

    const minText = getLegacyHandleText(this._config, 0);
    if (minText !== undefined) {
      setLegacyHandle(entities, 0, { text: minText });
    }

    const maxText = getLegacyHandleText(this._config, 1);
    if (maxText !== undefined) {
      setLegacyHandle(entities, 1, { text: maxText });
    }

    this._config.entities = entities;
    delete this._config.entity_min;
    delete this._config.entity_max;
    clearLegacyEntityTexts(this._config);
    // legacy entities configuration end

    if (!Array.isArray(this._config.entities) || this._config.entities.length === 0) {
      throw new Error("You need to define at least one entity in 'entities'");
    }

    const entityCount = this._config.entities.length;

    this._entities = this._config.entities.map((handleConfig, index) => {
      const entityLabel = this._getEntityLabel(index);

      if (!handleConfig?.entity) {
        throw new Error(`You need to define ${entityLabel}`);
      }
      assertOptionalString(handleConfig.text, this._getEntityTextLabel(index));
      assertOptionalBoolean(
        handleConfig.connectprevious,
        this._getEntityConnectPreviousLabel(index),
      );
      if (handleConfig.connectprevious == null) {
        handleConfig.connectprevious = entityCount <= 1 ? true : index > 0;
      }
      if (!isValidEntityId(handleConfig.entity)) {
        throw new Error(`Invalid format for ${entityLabel}. Expected domain.object_id`);
      }
      return new FlexSliderCardEntity(handleConfig.entity, handleConfig.text ?? "");
    });

    const uniqueEntityIds = new Set(this._entities.map((entity) => entity.entityId));
    if (uniqueEntityIds.size !== this._entities.length) {
      throw new Error("Configured entities must be unique");
    }

    this._entitytype = this._entities[0].entitytype;
    for (const entity of this._entities) {
      if (entity.entitytype !== this._entitytype) {
        throw new Error("All configured entities must use compatible domains");
      }
    }
  }

  protected _updateEntities(hass: HomeAssistant): void {
    this._entities.forEach((entity) => entity.update(hass));
  }

  protected _resetEntities(): void {
    if (this.entitiesExist()) {
      this.entitiesResetBaseline();
    }
  }

  public get entitytype(): FlexSliderCardEntityType {
    if (this._entitytype === undefined) {
      throw new Error("Entity type is not defined in config");
    }
    return this._entitytype;
  }

  public get entities(): FlexSliderCardEntity[] {
    return this._entities;
  }

  public get entityCount(): number {
    return this._entities.length;
  }

  public get hasReference(): boolean {
    return this._referenceEntity !== undefined;
  }

  public get referenceEntity(): FlexSliderCardEntity {
    if (!this._referenceEntity) {
      throw new Error("Reference entity is not defined in config");
    }
    return this._referenceEntity;
  }

  public entitiesExist(): boolean {
    return this._entities.every((entity) => entity.exists()) &&
      (!this.hasReference || this.referenceEntity.exists());
  }

  public entitiesResetBaseline(): void {
    this._entities.forEach((entity) => entity.resetBaseline());
    this._referenceEntity?.resetBaseline();
  }

  public entitiesSetBaseline(): void {
    this._entities.forEach((entity) => entity.setBaseline());
    this._referenceEntity?.setBaseline();
  }

  public entitiesIsUpdated(): boolean {
    return this._entities.some((entity) => entity.isUpdated()) ||
      this._referenceEntity?.isUpdated() === true;
  }

  private _getEntityLabel(index: number): string {
    return `Entity ${index + 1}`;
  }

  private _getEntityTextLabel(index: number): string {
    return `Text ${index + 1}`;
  }

  private _getEntityConnectPreviousLabel(index: number): string {
    return `Connect with previous for ${this._getEntityLabel(index)}`;
  }

}
