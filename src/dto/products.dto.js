class productsDTO {
    constructor({ title, description, thumbnail, code, stock, category, id, price, owner }) {
        this.title = title;
        this.description = description;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
        this.category = category;
        this.id = id;
        this.price = price;
        this.owner = owner
    }
}

module.exports = { productsDTO };