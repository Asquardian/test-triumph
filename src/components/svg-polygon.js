export class Polygon extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.position = { x: 0, y: 0 }

    this.style.zIndex = "1";

    this.setAttribute('draggable', "true");
    // Инициализация точек
    if (this.hasAttribute("points")) {
      this.points = JSON.parse(this.getAttribute("points"));
    } else {
      const pointsNumber = Math.floor(Math.random() * 5) + 3; // Минимальное число точек = 3
      this.points = this.generateSmoothPolygon(pointsNumber)
      this.setAttribute("points", JSON.stringify(this.points));
    }


    this.addEventListener("serialize", this.serialize);
  }

  static get observedAttributes() {
    return ['points'];
  }

  //Вынес в отдельный метод, чтобы проще было инициализировать перемещение в раб области
  initMove() {
    this.addEventListener("dragstart", this.startDragging)
    this.addEventListener("dragend", this.endDragging)
    this.addEventListener("dragover", this.moveElement)
  }

  //Сохранение
  serialize(event) {
    event.detail.polygons.push({
      position: this.position,
      points: this.points
    });
  }

  startDragging(event) {
    //Ставим data, нужен, чтобы при drag из буффера не баговалось dragover событие
    event.dataTransfer.setData('application/x-svg-polygon-work', 'true');

    // Убираем призрака
    const dragImage = new Image();
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    this.isDragging = true;
    [this.offsetX, this.offsetY] = this.getOffset(event.clientX, event.clientY)
  }

  endDragging() {
    this.isDragging = false;
  }

  //Нужно, чтобы при dnd элемент смещался относительно курсора. Также метод учитывает scale родительского элемента
  getOffset(x, y) {
    const rect = this.getBoundingClientRect();
    const parentRect = this.parentElement.getBoundingClientRect();

    const scaleX = parentRect.width / this.parentElement.offsetWidth;
    const scaleY = parentRect.height / this.parentElement.offsetHeight;


    return [(x - rect.left) / scaleX, (y - rect.top) / scaleY]
  }

  moveElement(event) {

    if (!event.dataTransfer.types.includes('application/x-svg-polygon-work')) {
      return; // Игнорируем элементы вне раб области
    }

    this.position = this.setPositionElement(event.clientX, event.clientY);

    this.style.setProperty("--x", `${this.position.x}px`)
    this.style.setProperty("--y", `${this.position.y}px`)
  }

  setPositionElement(clientX, clientY) {

    const parentRect = this.parentElement.getBoundingClientRect();
    const scaleX = parentRect.width / this.parentElement.offsetWidth;
    const scaleY = parentRect.height / this.parentElement.offsetHeight;

    // Вычисляем позицию относительно контейнера с учётом scale
    const x = (clientX - parentRect.left - this.offsetX * scaleX);
    const y = (clientY - parentRect.top - this.offsetY * scaleY);

    return {
      x: x / scaleX,
      y: y / scaleY,
    }
  }

  attributeChangedCallback(propName, oldValue, newValue) {
    if (propName === 'points' && newValue) {
      this.points = JSON.parse(newValue);
      this.render();
    }
  }

  connectedCallback() {
    this.position.x = this.style.getPropertyValue("--x").replace("px", "");
    this.position.y = this.style.getPropertyValue("--y").replace("px", "");

    if(this.closest("work-area")) {
      this.initMove(); //Если находится в рабочей зоне
    } else {
      this.addEventListener("dragend", this.onDrag)
    }
    this.render();
  }

  onDrag(event) {
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    const dropTarget = elements.find((el) => el.tagName.toLowerCase() === "work-area");

    if(dropTarget) {
      const clone = new Polygon();
      clone.setAttribute("points", JSON.stringify(this.points)); //Создаем точный клон элемента
      dropTarget.append(clone);
    }
  }

  //Создание точек для случайной фигуры.
  generateSmoothPolygon(numPoints, maxSize = 30) {
    const center = { x: maxSize/2, y: maxSize/2 };
    const baseRadius = maxSize/2 * 0.8;

    const basePoints = Array.from({ length: numPoints }, (_, i) => {
      const angle = (i * 2 * Math.PI) / numPoints;
      return {
        x: center.x + baseRadius * Math.cos(angle),
        y: center.y + baseRadius * Math.sin(angle)
      };
    });

    const smoothPoints = [];
    for (let i = 0; i < basePoints.length; i++) {
      const nextIdx = (i + 1) % basePoints.length;
      smoothPoints.push(basePoints[i]);

      smoothPoints.push({
        x: (basePoints[i].x + basePoints[nextIdx].x) / 2 + (Math.random() - 0.5) * 5,
        y: (basePoints[i].y + basePoints[nextIdx].y) / 2 + (Math.random() - 0.5) * 5
      });
    }

    return smoothPoints;
  }

  set isDragging(value) {
    this._isDragging = value;

    this.style.zIndex = value? "10" : "1"; // Устанавливаем zIndex, чтобы элементы не мешали друг другу
  }

  set offsetX(value) {
    this._offsetX = value;
  }

  set offsetY(value) {
    this._offsetY = value;
  }


  get offsetX() {
    return this._offsetX;
  }

  get offsetY() {
    return this._offsetY;
  }

  render() {
    // Очищаем shadow root перед рендером
    this.shadow.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 30 30'); // Подгоняем под размеры точек (0-30)

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', this.points.map(p => `${p.x},${p.y}`).join(' '));
    polygon.setAttribute('fill', 'lightblue');
    polygon.setAttribute('stroke', 'darkblue');
    polygon.setAttribute('stroke-width', '1');

    svg.appendChild(polygon);
    this.shadow.appendChild(svg);

    // Добавляем базовые стили для shadow DOM
    const style = document.createElement('style');
    style.textContent = `
            :host {
                display: inline-block;
            }
        `;
    this.shadow.appendChild(style);
  }
}

