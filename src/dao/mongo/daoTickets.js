const Ticket = require('../../models/ticket.model');

class TicketDAO {
    async getTickets() {
        return await Ticket.find();
    }

    async getTicketById(id) {
        return await Ticket.findById(id);
    }

    async addTicket(data) {
        return await Ticket.create(data);
    }

    async updateTicket(id, data) {
        return await Ticket.updateOne({ _id: id }, { $set: data });
    }

    async deleteTicket(id) {
        return await Ticket.deleteOne({ _id: id });
    }
}

module.exports = TicketDAO;
