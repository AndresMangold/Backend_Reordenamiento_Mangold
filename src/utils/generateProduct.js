const { fakerES: faker } = require('@faker-js/faker');

const generateProduct = () => ({
    id: faker.database.mongodbObjectId(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
    thumbnail: faker.image.url(),
    code: faker.string.alphanumeric(10),
    stock: faker.number.int({ min: 0, max: 200 }),
    category: faker.commerce.department(),
})

module.exports = { generateProduct };