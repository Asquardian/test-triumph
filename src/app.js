import {Polygon} from "./components/svg-polygon";
import {WorkArea} from "./components/workarea";

export function init() {

  //кнопка сохранить
  const saveBtn = document.querySelector(".js-save");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const serializeEvent = new CustomEvent('serialize', {
        bubbles: false,
        composed: true,
        cancelable: true,
        detail: {polygons: []}
      })

      document.querySelectorAll("work-area svg-polygon").forEach(
        el => el.dispatchEvent(serializeEvent)
      )

      if (serializeEvent.detail.polygons.length > 0) {
        localStorage.setItem('polygons', JSON.stringify(serializeEvent.detail.polygons));
      }
    })
  }

  //кнопка отчистить
  const clearBtn = document.querySelector(".js-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem('polygons');

      document.querySelectorAll("work-area svg-polygon").forEach(
        el => el.remove()
      )
    })
  }


  //кнопка создать новые элементы
  const createBtn = document.querySelector(".js-create");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      const container = document.querySelector(".js-buffer-elements");
      if(!container) {
        return;
      }
      container.innerHTML = '';
      for(let i = 0; i < 5; i++) {
        const polygon = new Polygon;
        container.appendChild(polygon);
      }
    })
  }

  customElements.define('svg-polygon', Polygon);
  customElements.define('work-area', WorkArea);
}
