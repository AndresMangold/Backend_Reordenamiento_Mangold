class ProductsDTO {
    constructor ({ title, description, price, thumbnail, code, stock, category, id}) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
        this.category = category;
        this.id = id
    }
}

module.exports = { ProductsDTO }