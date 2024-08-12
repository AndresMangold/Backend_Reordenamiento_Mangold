class Controller {

    startLogerTest(req, res) {
        try {
            req.logger.debug('DEBUG test - Relevancia: 5');
            req.logger.http('HTTP test - Relevancia: 4');
            req.logger.info('INFO test - Relevancia: 3');
            req.logger.warning('WARNING test - Relevancia: 2');
            req.logger.error('ERROR test - Relevancia: 1');
            req.logger.fatal('FATAL test - Relevancia: 0');

            res.status(200).json('Testeo de log finalizado');
        } catch (error) {
            res.status(500).json('Error en el logger Test!');
        }
    }
}

module.exports = { Controller };