const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['accessToken'];
    }
    return token;
};

module.exports = cookieExtractor;
