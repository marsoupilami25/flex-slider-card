import { minutesToTime } from "./utils/utils";
import { FlexSliderCardEntity, FlexSliderCardEntityType } from "./flex-slider-card-entity";
import { FlexSliderCardConfigMngr } from "./config/flex-slider-card-config";

export class FlexSliderCardValuesBar {

  private _config: FlexSliderCardConfigMngr;
  private _valueBarElement: HTMLElement;

  constructor(config: FlexSliderCardConfigMngr, htmlelement: HTMLElement) {
    this._config = config;                           // reference to the card configuration
    this._valueBarElement = htmlelement;             // reference to the DOM element of the values bar
  }

  update(values: number[]): void {
    const mintext = this._config.mintext;
    const maxtext = this._config.maxtext;
    const unit = this._config.unit;
    const minVal = this._sliderToDisplay(values[0]);
    const maxVal = this._sliderToDisplay(values[1]);
    const minElement = this._valueBarElement.querySelector<HTMLElement>("#min-value");
    const maxElement = this._valueBarElement.querySelector<HTMLElement>("#max-value");
    
    if (!minElement || !maxElement) {
      throw new Error("Value bar elements not found in DOM");
    }
    
    minElement.textContent = `${mintext}${minVal}${unit}`;
    maxElement.textContent = `${maxtext}${maxVal}${unit}`;
  }

  _sliderToDisplay(value: number): string {
    if (this._config.entitytype == FlexSliderCardEntityType.NUMBER) {
      return Number(value).toFixed(Number(this._config.digits));
    }
    if (this._config.entitytype == FlexSliderCardEntityType.TIME) {
      return minutesToTime(value);
    }
    throw new Error("Unsupported entity type");
  }

}