const generateInvalidCredentialsUserData = ({ email, password }) => {
    return `Credenciales de usuario inválidas:
    * email: No puede enviar un string vacio ${email}(${typeof email})
    * password: No puede enviar un string vacio ${password} (${typeof password})`
}

const generateInvalidProductData = (title, description, price, thumbnail, code, status, stock, category) => {
    return `
        Datos del producto inválidos:
        * título: ${!title ? 'No puede enviar un string vacío' : 'Válido'} (${title})
        * descripción: ${!description ? 'No puede enviar un string vacío' : 'Válido'} (${description})
        * precio: ${isNaN(+price) || +price <= 0 ? 'Debe ser un número positivo' : 'Válido'} (${price})
        * thumbnail: ${thumbnail ? 'Válido' : 'No requerido'} (${thumbnail})
        * código: ${!code ? 'No puede enviar un string vacío y debe ser único' : 'Válido'} (${code})
        * status: ${typeof status === 'undefined' ? 'No requerido' : 'Válido'} (${status})
        * stock: ${isNaN(+stock) || +stock < 0 ? 'Debe ser un número mayor o igual a 0' : 'Válido'} (${stock})
        * categoría: ${!category ? 'No puede enviar un string vacío' : 'Válido'} (${category})
    `;
}

module.exports = { generateInvalidCredentialsUserData, generateInvalidProductData };