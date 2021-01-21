class BaseError extends Error {
    constructor(name,message) {
        super(message);
        this.name = name;
    }
}

function BaseErrorHandler(err, res) {
    switch(err.name){
        case('ValidationError'):
            res.status(400);
            break;
        case('Unauthorized'):
            res.status(401);
            break;
        case('JsonWebTokenError'):
            res.status(401);
            break;
        case('TokenExpiredError'):
            res.status(401);
            break;
            case('NotFoundError'):
            res.status(404);
            break;
        default:
            res.status(500);
            break;
    }
    res.json({'errors': err.message});

};

function NotFoundErrorHandler(req,res) {
    res.status(404);
    res.json({'errors': `Cannot ${req.method} ${req.originalUrl}`});
};

module.exports = {
    BaseError,
    baseErrorHandler: BaseErrorHandler,
    notFoundErrorHandler: NotFoundErrorHandler,
}
