class usersTokenDTO {
    constructor(user) {
        this.id = user._id ? user._id.toString() : null;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.age = user.age;
        this.email = user.email;
        this.role = user.role;
        this.cart = user.cart ? user.cart._id.toString() : null
    }
}

module.exports = { usersTokenDTO };

