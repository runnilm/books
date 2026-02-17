export function flashMiddleware() {
    return function flash(req, res, next) {
        const messages = req.session?.flash ?? [];
        if (req.session) req.session.flash = [];

        res.locals.flash = messages;

        req.flash = (type, message) => {
            if (!req.session) return;
            if (!Array.isArray(req.session.flash)) req.session.flash = [];
            req.session.flash.push({ type, message });
        };

        next();
    };
}
