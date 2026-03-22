import nouiCss from "nouislider/dist/nouislider.css?inline";

export const compactFlexSliderCardCss: string = `
  ${nouiCss}
  
  :host([compact]) {
    display: block;
    height: 100%;
    --flex-slider-card-barvalues-font-size: 0.8rem;
    --flex-slider-card-barvalues-padding-bottom: 1px;
  }
  
  .container.compact {
    height: 100%;
    padding-bottom: 3px;
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
  
  .container.compact.no-title {
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: center;
  }

  .container.compact .title {
    display: flex;
    height: 20px;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: var(--primary-text-color);
    /* border: 1px solid blue; /* Debugging border */
  }
 
  .container.compact .slider-with-values {
    width: 90%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    /* border: 1px solid red; /* Debugging border */
  }

  .container.compact .slider-container {
    width: 100%;
    height: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* border: 1px solid green; /* Debugging border */
  }
  
  .container.compact .slider {
    width: 100%;
  }
  
  /* noUiSlider overrides */

  .container.compact .noUi-target {
    height: 6px;
    background: color-mix(in srgb, var(--disabled-color) 30%, transparent);
    border-radius: 4px / 6px;
    border: none;
    box-shadow: none;
  }
  
  .container.compact .noUi-base {
    height: 6px;
  }
  
  .container.compact .noUi-connect {
    height: 6px;
    background: color-mix(in srgb, var(--primary-color) 30%, transparent);
  }
  
  .container.compact .noUi-horizontal .noUi-handle {
    width: 12px;
    height: 12px;
    top: -3px;
    right: -6px;
    background: var(--primary-color);
    border-width: 0px;
    border-radius: 10px;
    box-shadow: none;
  }
  
  .container.compact .noUi-handle::before, .container.compact .noUi-handle::after {
    display: none;
  }
`;
