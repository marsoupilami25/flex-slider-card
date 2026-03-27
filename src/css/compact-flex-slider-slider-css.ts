export const compactFlexSliderSliderCardCss: string = `
  
  .slider.compact.noUi-target {
    height: 6px;
    background: color-mix(in srgb, var(--disabled-color) 30%, transparent);
    border-radius: 4px / 6px;
    border: none;
    box-shadow: none;
  }
  
  .slider.compact .noUi-base {
    height: 6px;
  }
  
  .slider.compact .noUi-connect {
    height: 6px;
    background: color-mix(in srgb, var(--primary-color) 30%, transparent);
  }
  
  .slider.compact.noUi-horizontal .noUi-handle {
    width: 12px;
    height: 12px;
    top: -3px;
    right: -6px;
    background: var(--primary-color);
    border-width: 0px;
    border-radius: 10px;
    box-shadow: none;
  }
  
  .slider.compact .noUi-handle::before, .slider.compact .noUi-handle::after {
    display: none;
  }
`;
