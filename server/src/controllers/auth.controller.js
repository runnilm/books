export function authController({ auth }) {
    return {
        register: async (req, res) => {
            const user = await auth.register(req.validated.body);
            req.session.user = user;
            res.status(201).json({
                ok: true,
                user,
            });
        },

        login: async (req, res) => {
            const user = await auth.login(req.validated.body);
            req.session.user = user;
            res.json({
                ok: true,
                user,
            });
        },

        logout: async (req, res) => {
            req.session.destroy((err) => {
                if (err) return res.status(500).json({ ok: false });
                res.json({
                    ok: true,
                });
            });
        },

        me: async (req, res) => {
            res.json({
                user: req.session?.user ?? null,
            });
        },
    };
}
