class Image {
    constructor() {

    }
    async getImage() {
        try {
            const URL = 'https://picsum.photos/1920/1080';
            const response = await fetch(URL);
            const blob = await response.blob();
            // this.imgUrl = 
            return window.URL.createObjectURL(blob);

        } catch (error) {
            console.error('Error fetching random image:', error);
            return "./img/profilepic.png"
        }
    }
}

export default Image