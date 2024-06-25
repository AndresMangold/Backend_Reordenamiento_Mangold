const User = require('../../models/user.model');

class UserDAO {
    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async create(user) {
        return await User.create(user);
    }

    async changeRole(id, rol) {
        return await Users.updateOne({ _id: id }, { $set: { role } });
    }

    async updatePassword(email, password) {
        return await User.updateOne({ email }, { $set: { password } });
    }

    async deleteByEmail(email) {
        return await User.deleteOne({ email });
    }

    async findById(id) {
        return await User.findOne({ _id: id });
    }

    async findAll() {
        return await User.find();
    }
}

module.exports = UserDAO;
