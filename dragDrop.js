import PositionElements from './positionElements.js';

class DragDrop {
  constructor() {
    this.positionElements = new PositionElements();
    this.selected = null;
    this.offset = { x: 0, y: 0 };
    this.dragableLeft;
    this.dragableTop;
    this.dragDropEvents();
    this.points = {
      correct: 0,
      wrong: 0
    };
    this.count = 0
  }

  dragDropEvents() {
    const { dragableDivs, puzzleDivs, cells, modal, newGame, cAttempt, wAttempt, cellAmounts, winState, wonImg } = this.positionElements.element;

    dragableDivs.forEach((dragableDiv, i) => {
      dragableDiv.addEventListener('touchstart', (e) => {

        this.dragableLeft = dragableDiv.style.left;
        this.dragableTop = dragableDiv.style.top

        this.selected = e.target;
        const rect = cells.getBoundingClientRect();

        this.offset = {
          x: rect.left,
          y: rect.top
        };
        this.selected.style.zIndex = '4';
      });

      dragableDiv.addEventListener('touchmove', (e) => {

        e.preventDefault();
        const touch = e.touches[0];

        this.selected.style.left = `${touch.pageX - this.offset.x}px`;
        this.selected.style.top = `${touch.pageY - this.offset.y}px`;

      });

      dragableDiv.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const droppedAt = document.elementFromPoint(touch.pageX, touch.pageY);

        if (puzzleDivs.includes(droppedAt) && droppedAt.children.length === 0) {

          const dropRect = droppedAt.getBoundingClientRect()
          const selectedRect = this.selected.getBoundingClientRect()

          this.selected.style.left = `${dropRect.left - cells.offsetLeft}px`;
          this.selected.style.top = `${dropRect.top - cells.offsetTop}px`;
          this.selected.style.border = 'none';
          droppedAt.appendChild(this.selected)
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
          
//      win lose.  
          if (this.points.correct === cellAmounts) {
            modal.style.cssText = "opacity: 1; visibility: visible;";
            cAttempt.innerText = this.points.correct;
            wAttempt.innerText = this.points.wrong;
            winState.innerText = 'You Win';
            wonImg.src = 'svg/trophy.png';
            newGame.addEventListener('click', () => {
              location.reload();
            });
          }
          const found = puzzleDivs.find((div) => {
            return !div.firstElementChild
          })
          if (!found && this.points.correct < cellAmounts) {
            modal.style.cssText = "opacity: 1; visibility: visible;";
            cAttempt.innerText = this.points.correct;
            wAttempt.innerText = this.points.wrong;
            winState.innerText = 'You Lost';
            wonImg.src = '';
            newGame.innerText = 'New Game';
            newGame.addEventListener('click', () => {
              location.reload();
            });
          }

        } else {
          //return to previous place
          console.log('no')
          this.selected.style.left = `${this.dragableLeft}`;
          this.selected.style.top = `${this.dragableTop}`
        }

        this.selected.style.zIndex = '';
        this.selected = null;

      });
    });
  }
}

export default DragDrop;