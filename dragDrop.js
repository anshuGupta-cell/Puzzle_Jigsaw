import PositionElements from './positionElements.js';

class DragDrop {
  constructor() {
    this.positionElements = new PositionElements();
    this.selected = null;
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
      zone.addEventListener('drop', (e) => this.handleNativeDrop(e));
    });

  }

  handleTouchStart(e){
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

	handleTouchMove(e){
        this.selected.style.position = 'fixed';

  			if (!this.selected) return;
        e.preventDefault(); // Stop scrolling
        const touch = e.touches[0];

        // Move relative to viewport
        this.selected.style.left = `${touch.clientX - this.offset.x}px`;
        this.selected.style.top = `${touch.clientY - this.offset.y}px`;
      
	}

	handleTouchEnd(e, puzzleDivs){
	if (!this.selected) return;
        const touch = e.changedTouches[0];
        
        // Find what's under the finger
        const droppedAt = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Check if dropped on a puzzle cell (or an empty child of a puzzle cell)
        const targetCell = puzzleDivs.find(div => div === droppedAt || div.contains(droppedAt));

        if (targetCell && targetCell.children.length === 0) {
          // Success: Snap to grid
          this.finalizeDrop(targetCell);
          this.checkWinCondition();
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

  handleNativeDrop(e) {
    e.preventDefault();
    // Logic: If we drop on the image inside the cell, get the cell (parent) instead
    let target = e.currentTarget;
    this.finalizeMove(target);
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



  finalizeDrop(targetCell) {
    const { cells } = this.positionElements.element;
    
    // Reset styles to let the grid/container take over
    this.selected.style.position = 'relative';
    this.selected.style.left = '0';
    this.selected.style.top = '0';
    this.selected.style.width = '100%'; 
    this.selected.style.height = '100%';
    
    targetCell.appendChild(this.selected);
    
    // Logic for correct/wrong pieces
    if (this.selected.dataset.index !== targetCell.dataset.index) {
      this.points.wrong++;
    }
  }

  returnToPrevious() {
    this.selected.style.position = 'relative';
    this.selected.style.left = this.originalPos.left;
    this.selected.style.top = this.originalPos.top;
    this.selected.style.width = '';
    this.selected.style.height = '';
    this.originalPos.parent.appendChild(this.selected);
  }

  checkWinCondition() {
    const { puzzleDivs, modal, cellAmounts, cAttempt, wAttempt, winState, wonImg, newGame } = this.positionElements.element;
    
    let correctCount = 0;
    let filledCount = 0;

    puzzleDivs.forEach((div) => {
      if (div.firstElementChild) {
        filledCount++;
        if (div.dataset.index === div.firstElementChild.dataset.index) {
          correctCount++;
        }
      }
    });

    this.points.correct = correctCount;

    // Win Logic
    if (correctCount === cellAmounts) {
      this.showModal("You Win", 'svg/trophy.png');
    } 
    // Lose Logic (Grid full but not all correct)
    else if (filledCount === cellAmounts) {
      this.showModal("You Lost", '');
    }
  }

  showModal(text, imgSrc) {
    const { modal, winState, wonImg, cAttempt, wAttempt, newGame } = this.positionElements.element;
    modal.style.cssText = "opacity: 1; visibility: visible;";
    winState.innerText = text;
    wonImg.src = imgSrc;
    cAttempt.innerText = this.points.correct;
    wAttempt.innerText = this.points.wrong;

    newGame.addEventListener('click', () => location.reload());
  }
}

export default DragDrop;
