import Elements from './Elements.js';

class PositionElements {
  constructor() {
    this.element = new Elements();
    const { cellAmounts } = this.element
    this.cellAmounts = cellAmounts
    this.backgroundSize = Math.sqrt(cellAmounts) * 100


    this.imgUrl = "img/ruka.jpeg";
    // this.imgUrl = "img/profilepic.png";
    this.leftPositions = Array.from({ length: Math.sqrt(cellAmounts) }, (_, i) => i * 100);
    this.topPositions = Array.from({ length: Math.sqrt(cellAmounts) }, (_, i) => i * 100);

    this.element.preview.src = this.imgUrl
    this.element.preview.onload = () => {
      this.imgeWidth = this.element.preview.naturalWidth
      this.imgeHeight = this.element.preview.naturalHeight
      this.elementProps()
      this.addDragable();
    }


  }
  shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  shufflePositions() {
    return (
      this.shuffle(this.leftPositions).map((leftPosition) => (
        this.shuffle(this.topPositions).map((topPosition) => [leftPosition, topPosition])
      )).reduce((position, item) => [...position, ...item])
    )
  }

  bgPositions() {
    return (
      this.topPositions.map((topPosition) => (
        this.leftPositions.map((leftPosition) => [topPosition, leftPosition])
      )).reduce((position, item) => [...position, ...item])
    )
  }

  async randomImg() {
    try {
      const URL = 'https://picsum.photos/1080/1920';
      const response = await fetch(URL);
      const blob = await response.blob();
      this.imgUrl = window.URL.createObjectURL(blob);

    } catch (error) {
      console.error('Error fetching random image:', error);
    }
  }
  // async randomImg() {
  //   try {
  //     const URL = 'https://api.waifu.pics/nsfw/waifu';
  //     const response = await fetch(URL);
  //     console.log(response.url)
  //     const data = await response.json();
  //     this.imgUrl = data.url

  //   } catch (error) {
  //     console.error('Error fetching random image:', error);
  //   }
  // }

  async addDragable() {
    const { cells, dragableDivs, preview, changeImg, puzzle } = this.element

    const bgPositions = this.bgPositions()

    const shufflePositions = this.shufflePositions()

    // await this.randomImg();

    dragableDivs.forEach((div, i) => {
      cells.append(div)
      div.style.backgroundImage = ` url(${this.imgUrl})`
      div.style.backgroundPosition = `-${shufflePositions[i][1]}% -${shufflePositions[i][0]}%`;
      div.setAttribute('data-index', Math.sqrt(this.cellAmounts) * (shufflePositions[i][0] / 100) + (shufflePositions[i][1] / 100))

      div.style.backgroundSize = this.backgroundSize + '%';
      div.style.aspectRatio = this.imgeWidth / this.imgeHeight;
    })

    // changeImg.addEventListener('click', () => {
    //   location.reload();
    // })

  }

  elementProps() {

    const { puzzle } = this.element
    puzzle.style.aspectRatio = this.imgeWidth / this.imgeHeight;
    const size = Math.sqrt(this.cellAmounts)

    puzzle.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    puzzle.style.gridTemplateRows = `repeat(${size}, 1fr)`;



  }

}
export default PositionElements;