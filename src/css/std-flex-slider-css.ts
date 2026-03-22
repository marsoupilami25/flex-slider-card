import nouiCss from "nouislider/dist/nouislider.css?inline";

export const stdFlexSliderCardCss: string = `
  ${nouiCss}
  
  :host([std]) {
    display: block;
    height: 100%;
    --flex-slider-card-barvalues-font-size: 1rem;
    --flex-slider-card-barvalues-padding-bottom: 2px;
  }
  
  .container.std {
    height: 100%;
    padding-bottom: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--ha-card-background, var(--card-background-color));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, 0px 2px 4px rgba(0, 0, 0, 0.16));
    border-width: var(--ha-card-border-width, 1px);
    border-style: solid;
    border-color: var(--ha-card-border-color, var(--divider-color));
    transition: all 0.3s ease-out;
  }
  
  .container.std.no-title {
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: center;
  }

  .container.std .title {
    display: flex;
    height: 35px;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--primary-text-color);
    /* border: 1px solid blue; /* Debugging border */
  }

  .container.std .slider-with-values {
    width: 90%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    /* border: 1px solid red; /* Debugging border */
  }
  
  .container.std .slider-container {
    width: 100%;
    height: 21px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* border: 1px solid green; /* Debugging border */
  }
  
  .container.std .slider {
    width: 100%;
  }

  .container.std.no-title .values {
    font-size: 0.9rem;
  }

  /* noUiSlider overrides */

  .container.std .noUi-target {
    height: 16px;
    background: color-mix(in srgb, var(--disabled-color) 30%, transparent);
    border-radius: 10px / 16px;
    border: none;
    box-shadow: none;
  }
  
  .container.std .noUi-base {
    height: 16px;
  }
  
  .container.std .noUi-connect {
    height: 16px;
    background: color-mix(in srgb, var(--primary-color) 30%, transparent);
  }
  
  .container.std .noUi-horizontal .noUi-handle {
    width: 18px;
    height: 18px;
    top: -1px;
    right: -9px;
    background: var(--primary-text-color);
    border-width: 3px;
    border-style: solid;
    border-color: var(--primary-color);
    border-radius: 15px;
    box-shadow: none;
  }
  
  .container.std .noUi-handle::before, .container.std .noUi-handle::after {
    display: none;
  }
`;
