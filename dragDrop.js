import PositionElements from './positionElements.js';

class DragDrop {
  constructor() {
    this.positionElements = new PositionElements();
    this.selected = null;
    this.initialPos = { x: 0, y: 0 };
    this.points = { correct: 0, wrong: 0 };
    this.initEvents();
  }

  initEvents() {
    const { dragableDivs, puzzleDivs, pieces } = this.positionElements.element;

    // Draggable Pieces
    dragableDivs.forEach((el) => {
      el.addEventListener('dragstart', (e) => this.handleNativeStart(e));
      el.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    });

    // Drop Zones (Puzzle Cells AND Pieces Tray for swapping back)
    [...puzzleDivs, pieces].forEach((zone) => {
      zone.addEventListener('dragover', (e) => e.preventDefault());
      zone.addEventListener('drop', (e) => this.handleNativeDrop(e));
    });
  }

  handleNativeStart(e) {
    this.selected = e.currentTarget;
    e.dataTransfer.setData('text/plain', ''); 
  }

  handleNativeDrop(e) {
    e.preventDefault();
    // Logic: If we drop on the image inside the cell, get the cell (parent) instead
    let target = e.currentTarget;
    this.finalizeMove(target);
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.selected = e.currentTarget;
    
    // Get current offset for smooth dragging
    const rect = this.selected.getBoundingClientRect();
    this.offset = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };

    this.selected.style.zIndex = '1000';
    // this.selected.style.position = 'fixed'; // Use fixed during drag to ignore scroll

    this.moveHandler = (me) => this.handleTouchMove(me);
    this.endHandler = (ee) => this.handleTouchEnd(ee);

    window.addEventListener('touchmove', this.moveHandler, { passive: false });
    window.addEventListener('touchend', this.endHandler);
  }

  handleTouchMove(e) {
    if (!this.selected) return;
    const touch = e.touches[0];
    // Move piece relative to viewport
    this.selected.style.left = `${touch.clientX - this.offset.x}px`;
    this.selected.style.top = `${touch.clientY - this.offset.y}px`;
  }

  handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    this.selected.style.display = 'none'; // Temporarily hide to find what's underneath
    const droppedAt = document.elementFromPoint(touch.clientX, touch.clientY);
    this.selected.style.display = 'block';

    const { puzzleDivs, pieces } = this.positionElements.element;
    
    // Find if the drop target is a puzzle cell or the pieces tray
    const targetCell = [...puzzleDivs, pieces].find(zone => zone.contains(droppedAt));

    if (targetCell) {
      this.finalizeMove(targetCell);
    } else {
      // Return to tray if dropped in dead space
      pieces.appendChild(this.selected);
      this.resetPieceStyles(this.selected);
    }

    window.removeEventListener('touchmove', this.moveHandler);
    window.removeEventListener('touchend', this.endHandler);
    this.selected = null;
  }

  finalizeMove(dropZone) {
    const { pieces } = this.positionElements.element;

    // --- SWAP LOGIC ---
    if (dropZone.children.length > 0 && dropZone !== pieces) {
      // If dropping on a cell that has a piece, move existing piece to tray
      const existingPiece = dropZone.firstElementChild;
      pieces.appendChild(existingPiece);
      this.resetPieceStyles(existingPiece);
    }

    // Append new piece
    dropZone.appendChild(this.selected);
    this.resetPieceStyles(this.selected);
    
    this.checkLogic();
  }

  resetPieceStyles(el) {
    el.style.position = 'relative';
    el.style.left = '0';
    el.style.top = '0';
    el.style.zIndex = '';
  }

  checkLogic() {
    const { puzzleDivs, cellAmounts } = this.positionElements.element;
    this.points.correct = 0;

    puzzleDivs.forEach((div) => {
      const child = div.firstElementChild;
      if (child && div.dataset.index === child.dataset.index) {
        this.points.correct++;
      }
    });

    if (this.points.correct === parseInt(cellAmounts)) {
      alert("Puzzle Complete!");
    }
  }
}

export default DragDrop;