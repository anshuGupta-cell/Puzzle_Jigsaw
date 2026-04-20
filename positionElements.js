import Elements from './Elements.js';

class PositionElements {
  constructor() {
    this.element = new Elements();
    this.leftPositions = [0, 20, 40, 60, 80];
    this.topPositions = [0, 25, 50, 75];
    this.addDragable();
    this.imgUrl = 'img/profile pic1.png';
    console.log(this.imgUrl);
    
  }
  shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
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
      console.log(response)
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
    const { cells, dragableDivs, preview, changeImg } = this.element
    const bgPositions = this.bgPositions()
    const shufflePositions = this.shufflePositions()

    await this.randomImg();

    preview.src = this.imgUrl

    dragableDivs.forEach((div, i) => {
      cells.append(div)
      div.style.backgroundImage = `url(${this.imgUrl})`
      div.style.backgroundPosition = `-${50}% -${50}%`
      div.style.backgroundPosition = `-${bgPositions[i][1]}% -${bgPositions[i][0]}%`
      
    })
    console.log(cells);

    // changeImg.addEventListener('click', () => {
    //   location.reload();
    // })

  }

}
export default PositionElements;