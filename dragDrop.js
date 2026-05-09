import PositionElements from './positionElements.js';

class DragDrop {
  constructor() {
    this.positionElements = new PositionElements();
    this.selected = null;
    this.droppedAt = null;
    this.offset = { x: 0, y: 0 };
    // Store original position to return if drop fails
    this.originalPos = { left: '', top: '', parent: null };
    this.points = { correct: 0, wrong: 0 };
    this.dragDropEvents();
  }

  dragDropEvents() {
    const { dragableDivs, puzzleDivs, pieces } = this.positionElements.element;

    dragableDivs.forEach((dragableDiv) => {

      dragableDiv.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });

      dragableDiv.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });

      dragableDiv.addEventListener('touchend', e => this.handleTouchEnd(e, puzzleDivs));

      dragableDiv.addEventListener('dragstart', (e) => this.handleNativeStart(e));

    });

    // Drop Zones (Puzzle Cells AND Pieces Tray for swapping back)
    [...puzzleDivs, pieces].forEach((zone) => {
      zone.addEventListener('dragover', (e) => e.preventDefault());
      zone.addEventListener('drop', (e) => this.handleNativeDrop(e, puzzleDivs));
    });

  }

  handleTouchStart(e) {
    this.selected = e.currentTarget;
    const rect = this.selected.getBoundingClientRect();
    const touch = e.touches[0];

    // Save state for "return to previous place"
    this.originalPos.left = this.selected.style.left;
    this.originalPos.top = this.selected.style.top;
    this.originalPos.parent = this.selected.parentElement;

    // Calculate offset so the piece doesn't "jump" to its corner
    this.offset = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };

    // UI Setup for dragging
    this.selected.style.width = `${rect.width}px`;
    this.selected.style.height = `${rect.height}px`;
    this.selected.style.zIndex = '1000';
    this.selected.style.pointerEvents = 'none'; // Critical for elementFromPoint

  }

  handleTouchMove(e) {
    this.selected.style.position = 'fixed';

    if (!this.selected) return;
    e.preventDefault(); // Stop scrolling
    const touch = e.touches[0];

    // Move relative to viewport
    this.selected.style.left = `${touch.clientX - this.offset.x}px`;
    this.selected.style.top = `${touch.clientY - this.offset.y}px`;

  }

  handleTouchEnd(e, puzzleDivs) {
    if (!this.selected) return;
    const touch = e.changedTouches[0];

    // Find what's under the finger
    const droppedAt = document.elementFromPoint(touch.clientX, touch.clientY);

    // Check if dropped on a puzzle cell (or an empty child of a puzzle cell)
    const targetCell = puzzleDivs.find(div => div === droppedAt || div.contains(droppedAt));

    if (targetCell && targetCell.children.length === 0) {
      // Success: Snap to grid
      this.finalizeDrop(targetCell);
      this.handlePoints(puzzleDivs, droppedAt)
    } else {
      // Failure: Return to tray or previous position
      this.returnToPrevious();
    }


    // Cleanup
    if (this.selected) {
      this.selected.style.pointerEvents = 'auto';
      this.selected.style.zIndex = '';
      this.selected = null;
    }


  }

  handleNativeStart(e) {
    this.selected = e.currentTarget;
    e.dataTransfer.setData('text/plain', '');
  }

  handleNativeDrop(e, puzzleDivs) {
    e.preventDefault();
    // Logic: If we drop on the image inside the cell, get the cell (parent) instead
    let target = e.currentTarget;
    this.finalizeMove(target, puzzleDivs);
  }

  finalizeMove(dropZone, puzzleDivs) {
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

    this.handlePoints(puzzleDivs, dropZone);
  }


  resetPieceStyles(el) {
    el.style.position = 'relative';
    el.style.left = '0';
    el.style.top = '0';
    el.style.zIndex = '';
  }



  finalizeDrop(targetCell) {
    const { cells } = this.positionElements.element;

    // Reset styles to let the grid/container take over
    this.selected.style.position = 'relative';
    this.selected.style.left = '0';
    this.selected.style.top = '0';
    this.selected.style.width = '100%';
    this.selected.style.height = '100%';

    targetCell.appendChild(this.selected);

    //   // Logic for correct/wrong pieces
    //   if (this.selected.dataset.index !== targetCell.dataset.index) {
    //     this.points.wrong++;
    //   }
  }

  returnToPrevious() {
    this.selected.style.position = 'relative';
    this.selected.style.left = this.originalPos.left;
    this.selected.style.top = this.originalPos.top;
    this.selected.style.width = '';
    this.selected.style.height = '';
    this.originalPos.parent.appendChild(this.selected);
  }

  handlePoints(puzzleDivs, droppedAt) {
    //points section 

    if (this.selected.dataset.index === droppedAt.dataset.index) {
      this.points.correct = 0;
      puzzleDivs.forEach((div) => {
        if (div.firstElementChild && div.dataset.index === div.firstElementChild.dataset.index) {
          this.points.correct++;
        }
      })
    } else {
      this.points.wrong++;
    }

    this.checkWin(puzzleDivs)

  }

  checkWin(puzzleDivs) {
    const { cellAmounts, modal, winState, wonImg, cAttempt, wAttempt, newGame } = this.positionElements.element

    if (this.points.correct === cellAmounts) {
      modal.classList.remove("hidden");
      cAttempt.innerText = this.points.correct;
      wAttempt.innerText = this.points.wrong;
      winState.innerText = 'You Win';
      wonImg.src = './img/win.png';

    }

    const foundEmptyCell = puzzleDivs.find((div) => {
      return !div.firstElementChild
    })
    if (!foundEmptyCell && this.points.correct < cellAmounts) {
      modal.classList.remove("hidden");
      cAttempt.innerText = this.points.correct;
      wAttempt.innerText = this.points.wrong;
      winState.innerText = 'You Lose';
      wonImg.src = './img/lose.png';
      newGame.innerText = 'New Game';
    }
    newGame.addEventListener('click', () => {
      location.reload();
    });
  }

  showModal(winStateText, imgSrc) {
    const { modal, winState, wonImg, cAttempt, wAttempt, newGame } = this.positionElements.element;
    modal.classList.remove("hidden");
    winState.innerText = winStateText;
    wonImg.src = imgSrc;
    cAttempt.innerText = this.points.correct;
    wAttempt.innerText = this.points.wrong;

    newGame.addEventListener('click', () => location.reload());
  }
}

export default DragDrop;
