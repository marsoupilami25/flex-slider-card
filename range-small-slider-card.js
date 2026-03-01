import { RangeSliderClass } from "./range-slider-class.js"

class RangeSmallSliderCard extends RangeSliderClass {

  _renderTemplate(name) {
    this.shadowRoot.innerHTML = `
      <style>
        @import "https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.0/nouislider.min.css";
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4px;
          /* border: 1px solid #ccc; */
          /* border-radius: 8px; */
          /* background: #f9f9f9; */
          /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
          max-width: 400px;
          margin: auto;
        }
        .slider {
          width: 100%;
          margin: 4px 0;
          height: 50%;
        }
        .values {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 0.85rem;
          font-family: Arial, sans-serif;
        }
        .title {
          /* font-size: 1rem; */
          /* font-weight: bold; */
          margin-bottom: 8px;
          color: var(--primary-text-color);
          font-family: Arial, sans-serif;
        }
        #min-value {
          color: var(--primary-text-color);
        }
        #max-value {
          color: var(--primary-text-color);
        }
        .noUi-base {
          height: 4px !important;
          background: #ddd;
          border-radius: 4px;
        }
        .noUi-connect {
          height: 4px !important;
        }
        .noUi-handle {
          width: 14px !important;
          height: 14px !important;
          top: -5px !important;
          right: -5px !important;
          background: #fff;
          border: 2px solid #007bff;
          border-radius: 50%;
        }
        .noUi-handle::before, .noUi-handle::after {
          display: none !important;
      </style>
      <div class="container">
        <div class="title">${name}</div>
        <div class="slider" id="slider"></div>
        <div class="values">
          <span id="min-value"></span>
          <span id="max-value"></span>
        </div>
      </div>
    `;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define('range-small-slider-card', RangeSmallSliderCard);

