const Product = require('../../models/product.model');

class daoProducts {
    constructor() {}

    async prepare() {
        if (Product.db.readyState !== 1) {
            throw new Error('Debe estar conectado a MongoDB');
        }
    }

    async getProducts(page, limit, sort, category, availability) {
        try {
            const query = {
                ...(category && { category }),
                ...(availability && { status: availability === 'true' })
            };
            const options = {
                limit: parseInt(limit),
                page: parseInt(page),
                sort: sort ? { price: sort } : undefined,
                lean: true,
                select: '-thumbnail'//Revisar esto para posterior uso de imgs
            };

            const allProducts = await Product.paginate(query, options);

            const status = allProducts ? 'success' : 'error';
            const prevLink = allProducts.hasPrevPage ? `/api/products?page=${allProducts.prevPage}` : null;
            const nextLink = allProducts.hasNextPage ? `/api/products?page=${allProducts.nextPage}` : null;

            const result = {
                status,
                payload: allProducts.docs,
                totalPages: allProducts.totalPages,
                prevPage: allProducts.prevPage,
                nextPage: allProducts.nextPage,
                page: allProducts.page,
                hasPrevPage: allProducts.hasPrevPage,
                hasNextPage: allProducts.hasNextPage,
                prevLink,
                nextLink
            };
            return result;
        } catch (error) {
            throw new Error('Error al obtener los productos');
        }
    }

    async getProductById(id) {
        try {
            const product = await Product.findOne({ _id: id }).select('-thumbnail'); //Sacar el .select para posterior use de imgs
            if (product) {
                return product;
            } else {
                throw new Error('El ID solicitado no existe.');
            }
        } catch (error) {
            console.error('Error al obtener el producto por ID:', error);
            throw new Error('Error al obtener el producto por ID');
        }
    }

    async updateProduct(id, fieldsToUpdate) {
        try {
            const areFieldsPresent = Object.keys(fieldsToUpdate).length > 0;

            if (!areFieldsPresent) {
                throw new Error('No se proporcionaron campos para actualizar');
            }

            const updatedProduct = await Product.updateOne({ _id: id }, { $set: fieldsToUpdate });

            if (updatedProduct.nModified === 0) {
                throw new Error('No se encontró el producto para actualizar');
            }

            return updatedProduct;
        } catch (error) {
            console.error('Error al actualizar el producto desde la Base de datos:', error);
            throw new Error('Error al actualizar el producto desde la Base de datos');
        }
    }

    async addProduct({ title, description, price, thumbnail, code, stock, category }) {
        const invalidOptions = isNaN(+price) || +price <= 0 || isNaN(+stock) || +stock < 0;

        if (!title || !description || !code || !category || invalidOptions) {
            throw new Error('Error al validar los datos');
        }

        const finalThumbnail = thumbnail ? thumbnail : 'Sin Imagen';

        try {
            await Product.create({
                title,
                description,
                price,
                thumbnail: finalThumbnail,
                code,
                stock,
                category
            });

            console.log('Producto agregado correctamente');
        } catch (error) {
            console.error('Error al agregar el producto desde DB:', error);
            throw new Error('Error al agregar el producto desde DB');
        }
    }

    async deleteProduct(productId) {
        try {
            await Product.deleteOne({ _id: productId });
        } catch (error) {
            throw new Error('Error al eliminar el producto en la Base de Datos');
        }
    }
}

module.exports = daoProducts;
