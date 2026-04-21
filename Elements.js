class Elements {

  constructor() {

    this.puzzle = document.querySelector('.puzzle');
    this.cells = document.querySelector('.pieces')
    this.cellAmounts = this.getCellAmounts();
    
    this.puzzleDivs = [];
    this.dragableDivs = [];
    this.preview = document.querySelector('.preview');
    this.changeImg = document.querySelector('.change-img');
    this.createElements();
    
  }
  createElements() {
    for (let i = 0; i < this.cellAmounts; i++) {
      const puzzleDiv = document.createElement('div')
      puzzleDiv.setAttribute('data-index',i)
      this.puzzle.append(puzzleDiv)
      this.puzzleDivs.push(puzzleDiv)
      
      const dragableDiv = document.createElement('div')
      dragableDiv.setAttribute('data-index',i)
      dragableDiv.setAttribute('dragable',true)
      this.dragableDivs.push(dragableDiv)
      
    }
  }

  getCellAmounts(){
    const cells = [4, 9, 16, 25, 36]
    return cells[Math.floor(Math.random() * 4)]

  }

  

}

export default Elements;