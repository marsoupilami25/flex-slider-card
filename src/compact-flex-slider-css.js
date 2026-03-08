import nouiCss from "nouislider/dist/nouislider.css?inline";

export const compactFlexSliderCardCss = `
  ${nouiCss}
  
  * {
  box-sizing: border-box;
  }
  
  :host {
    display: block;
    height: 100%;
  }
  
  ha-card {
    height: 100%;
  }
  
  .container {
    height: 100%;
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
  
  .container.no-title {
    padding-top: 2%;
    padding-bottom: 1%;
  }

  .title {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 3;
    font-size: 0.9rem;
    color: var(--primary-text-color);
  }
 
  .slider-with-values {
    width: 90%;
    flex: 7;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* border: 1px solid red; /* Debugging border */
  }

  .slider-container {
    width: 100%;
    height: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 1px;
    /* border: 1px solid green; /* Debugging border */
  }
  
  .slider {
    width: 100%;
  }
  
  .values {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    color: var(--primary-text-color);
    font-size: 0.8rem;
    width: 100%;
    padding-bottom: 1px;
  }
  
  .noUi-target {
    height: 6px;
    background: color-mix(in srgb, var(--disabled-color) 30%, transparent);
    border-radius: 4px / 6px;
    border: none;
    box-shadow: none;
  }
  
  .noUi-base {
    height: 6px;
  }
  
  .noUi-connect {
    height: 6px;
    background: color-mix(in srgb, var(--primary-color) 30%, transparent);
  }
  
  .noUi-horizontal .noUi-handle {
    width: 12px;
    height: 12px;
    top: -3px;
    right: -6px;
    background: var(--primary-color);
    border-width: 0px;
    border-radius: 10px;
    box-shadow: none;
  }
  
  .noUi-handle::before, .noUi-handle::after {
    display: none;
  }
`;
