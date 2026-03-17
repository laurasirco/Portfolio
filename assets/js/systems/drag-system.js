/**
 * StickerDragSystem
 * 
 * Sistema base para gestionar el arrastre de stickers con comportamiento consistente.
 * Proporciona:
 * - Anchor centrado en la posición del cursor al agarrar
 * - Seguimiento suave del cursor durante el arrastre
 * - Inertia reducida (50% menos) al soltar
 * - Soporte para todos los tipos de stickers (imagen, texto, 3D)
 */

class StickerDragSystem {
  /**
   * Inicializa el sistema de arrastre para un elemento sticker
   * @param {HTMLElement} stickerElement - Elemento a hacer draggable
   * @param {Object} options - Opciones de configuración
   * @param {number} options.inertiaMultiplier - Multiplicador de inertia (default: 0.5)
   * @param {Function} options.onDragStart - Callback al iniciar arrastre
   * @param {Function} options.onDragEnd - Callback al finalizar arrastre
   */
  init(stickerElement, options = {}) {
    this.element = stickerElement;
    this.options = {
      inertiaMultiplier: 0.5,
      ...options
    };
    
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.velocity = { x: 0, y: 0 };
    
    // Bind event handlers
    this.handleMouseDown = this.startDrag.bind(this);
    this.handleMouseMove = this.updateDrag.bind(this);
    this.handleMouseUp = this.endDrag.bind(this);
    
    // Attach event listeners
    this.element.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * Inicia el arrastre desde la posición del cursor
   * Centra el anchor en la posición del cursor
   * @param {MouseEvent} event - Evento del mouse
   */
  startDrag(event) {
    if (this.isDragging) return;
    
    this.isDragging = true;
    
    // Obtener posición del elemento
    const rect = this.element.getBoundingClientRect();
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;
    
    // Calcular offset desde el centro del elemento hasta la posición del cursor
    this.offsetX = event.clientX - elementCenterX;
    this.offsetY = event.clientY - elementCenterY;
    
    // Guardar última posición para calcular velocidad
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    
    // Callback opcional
    if (this.options.onDragStart) {
      this.options.onDragStart(event);
    }
  }

  /**
   * Actualiza la posición durante el arrastre
   * Mantiene el offset consistente desde el cursor
   * @param {MouseEvent} event - Evento del mouse
   */
  updateDrag(event) {
    if (!this.isDragging) return;
    
    // Calcular velocidad para inertia
    this.velocity.x = event.clientX - this.lastX;
    this.velocity.y = event.clientY - this.lastY;
    
    // Actualizar última posición
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    
    // Calcular nueva posición del elemento
    // El elemento debe estar centrado en la posición del cursor
    const newX = event.clientX - this.offsetX;
    const newY = event.clientY - this.offsetY;
    
    // Aplicar posición
    this.element.style.left = newX + 'px';
    this.element.style.top = newY + 'px';
  }

  /**
   * Finaliza el arrastre con inertia reducida
   * @param {MouseEvent} event - Evento del mouse
   */
  endDrag(event) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // Aplicar inertia reducida
    const inertia = this.calculateReducedInertia(this.velocity);
    
    if (inertia.x !== 0 || inertia.y !== 0) {
      this.applyInertia(inertia);
    }
    
    // Callback opcional
    if (this.options.onDragEnd) {
      this.options.onDragEnd(event);
    }
  }

  /**
   * Calcula la inertia reducida (50% menos que la original)
   * @param {Object} velocity - Velocidad actual {x, y}
   * @returns {Object} Inertia reducida {x, y}
   */
  calculateReducedInertia(velocity) {
    // Aplicar multiplicador de inertia (default 0.5 = 50% menos)
    return {
      x: velocity.x * this.options.inertiaMultiplier,
      y: velocity.y * this.options.inertiaMultiplier
    };
  }

  /**
   * Aplica inertia al elemento con desaceleración suave
   * @param {Object} inertia - Inertia inicial {x, y}
   */
  applyInertia(inertia) {
    const deceleration = 0.95; // Factor de desaceleración
    const minVelocity = 0.1; // Velocidad mínima antes de detener
    
    let currentVelocity = { ...inertia };
    const rect = this.element.getBoundingClientRect();
    let currentX = rect.left;
    let currentY = rect.top;
    
    const animate = () => {
      // Aplicar desaceleración
      currentVelocity.x *= deceleration;
      currentVelocity.y *= deceleration;
      
      // Actualizar posición
      currentX += currentVelocity.x;
      currentY += currentVelocity.y;
      
      this.element.style.left = currentX + 'px';
      this.element.style.top = currentY + 'px';
      
      // Continuar si la velocidad es significativa
      if (Math.abs(currentVelocity.x) > minVelocity || Math.abs(currentVelocity.y) > minVelocity) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Destruye el sistema de arrastre y limpia event listeners
   */
  destroy() {
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
}

// Exportar para uso en otros módulos
export { StickerDragSystem };
