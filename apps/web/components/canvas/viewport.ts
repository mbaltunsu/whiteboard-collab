export interface VisibleBounds {
  x: number
  y: number
  w: number
  h: number
}

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5.0

export class Viewport {
  private _translateX = 0
  private _translateY = 0
  private _scale = 1
  private _screenWidth = 0
  private _screenHeight = 0

  get translateX(): number {
    return this._translateX
  }

  get translateY(): number {
    return this._translateY
  }

  get scale(): number {
    return this._scale
  }

  setScreenSize(width: number, height: number): void {
    this._screenWidth = width
    this._screenHeight = height
  }

  screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this._translateX) / this._scale,
      y: (screenY - this._translateY) / this._scale,
    }
  }

  canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
    return {
      x: canvasX * this._scale + this._translateX,
      y: canvasY * this._scale + this._translateY,
    }
  }

  pan(dx: number, dy: number): void {
    this._translateX += dx
    this._translateY += dy
  }

  zoom(factor: number, centerX: number, centerY: number): void {
    const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this._scale * factor))
    if (newScale === this._scale) return

    // Adjust translation so that the point under (centerX, centerY) stays fixed
    const canvasPoint = this.screenToCanvas(centerX, centerY)
    this._scale = newScale
    this._translateX = centerX - canvasPoint.x * this._scale
    this._translateY = centerY - canvasPoint.y * this._scale
  }

  setScale(level: number): void {
    this._scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level))
  }

  getVisibleBounds(): VisibleBounds {
    const topLeft = this.screenToCanvas(0, 0)
    const bottomRight = this.screenToCanvas(this._screenWidth, this._screenHeight)
    return {
      x: topLeft.x,
      y: topLeft.y,
      w: bottomRight.x - topLeft.x,
      h: bottomRight.y - topLeft.y,
    }
  }

  getTransformMatrix(): DOMMatrix {
    return new DOMMatrix([this._scale, 0, 0, this._scale, this._translateX, this._translateY])
  }
}
