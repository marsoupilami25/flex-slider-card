import noUiSlider from "nouislider";
import { debuglog } from "./utils";

export class FlexSliderCardSlider {

  constructor(config, minvalue, maxvalue, htmlelement) {
    this._config = config;                           // reference to the card configuration
    this._userIsUpdating = false;                       //true when user is currently dragging the slider, false otherwise
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
    
    this._slider.on("change", (values) => {
      this._onChange(values);
    });
    
    this._slider.on("update", (values) => {
      this._onUpdate(values);
    });

    this._slider.on("end", () => {
      this._onEnd();
    });
  }

  /****************************************************/
  /* Methods                                          */
  /****************************************************/
  isUserUpdating() {
    return this._userIsUpdating;
  }

  update(min, max) {
    this._slider.set([min, max], false); // false to prevent firing the "update" event
  }

  destroy() {
    this._slider.destroy();
  }

  /****************************************************/
  /* CallBacks                                        */
  /****************************************************/

  _onStart() {
    debuglog("start");
    this._userIsUpdating = true;
  }

  _onChange(values) {
    debuglog("change");
    this._userIsUpdating = false;
    this._config.entities.min.value = values[0];
    this._config.entities.max.value = values[1];
  }

  _onUpdate(values) {
    debuglog("update");
    if (this._config.hasValuesBar()) {
      this._config.valuesBar.update(values);
    }
  }

  _onEnd() {
    debuglog("end");
    this._userIsUpdating = false;
  }

}