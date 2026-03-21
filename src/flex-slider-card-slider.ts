import noUiSlider, { API as NoUiSliderAPI } from "nouislider";
import { debuglog } from "./utils/utils";
import { FlexSliderCardConfigMngr } from "./config/flex-slider-card-config";

// Extension de HTMLElement pour typer noUiSlider
export interface NoUiSliderElement extends HTMLElement {
  noUiSlider: NoUiSliderAPI;
}

export class FlexSliderCardSlider {

  private _config: FlexSliderCardConfigMngr;          // reference to the card configuration
  private _slider: NoUiSliderAPI;                   // reference to the noUiSlider instance
  private _userIsUpdating: boolean = false;                 // true when user is currently dragging the slider, false otherwise

  constructor(config: FlexSliderCardConfigMngr, minvalue: number, maxvalue: number, htmlelement: NoUiSliderElement) {
    this._config = config;                           // reference to the card configuration
    
    noUiSlider.create(htmlelement, {
      start: [minvalue, maxvalue],
      connect: true,
      range: {
        'min': this._config.min,
        'max': this._config.max
      },
      step: this._config.step
    });
    this._slider = htmlelement.noUiSlider;           // reference to the noUiSlider instance
    
    this._slider.on("start", () => {
      this._onStart();
    });
    
    this._slider.on("change", (values: (number | string)[]) => {
      this._onChange(values);
    });
    
    this._slider.on("update", (values: (number | string)[]) => {
      this._onUpdate(values);
    });

    this._slider.on("end", () => {
      this._onEnd();
    });
  }

  /****************************************************/
  /* Methods                                          */
  /****************************************************/
  public isUserUpdating(): boolean {
    return this._userIsUpdating;
  }

  public update(min: number, max: number) {
    this._slider.set([min, max], false); // false to prevent firing the "update" event
  }

  public destroy(): void {
    this._slider.destroy();
  }

  /****************************************************/
  /* CallBacks                                        */
  /****************************************************/

  private _onStart(): void {
    debuglog("start");
    this._userIsUpdating = true;
  }

  private _onChange(values: (number | string)[]): void {
    debuglog("change");
    this._userIsUpdating = false;
    
    // noUiSlider renvoie souvent des strings → conversion recommandée
    const min = Number(values[0]);
    const max = Number(values[1]);

    this._config.entities.min.sliderValue = min;
    this._config.entities.max.sliderValue = max;
  }

  private _onUpdate(values: (number | string)[]): void {
    debuglog("update");
    if (this._config.hasValuesBar()) {
      const numbers: number[] = values.map(Number);
      this._config.valuesBar!.update(numbers);
    }
  }

  private _onEnd(): void {
    debuglog("end");
    this._userIsUpdating = false;
  }

}