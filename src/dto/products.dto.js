class productsDTO {
    constructor({ title, description, thumbnail, code, stock, category, id, price }) {
        this.title = title;
        this.description = description;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
        this.category = category;
        this.id = id;
        this.price = price
    }
}

module.exports = { productsDTO };