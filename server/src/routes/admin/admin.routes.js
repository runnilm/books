import { Router } from "express";
import csurf from "@dr.pogodin/csurf";
import { requireAdmin } from "../../middleware/requireAdmin.js";

export function adminRoutes({ controller }) {
    const router = Router();

    router.use(requireAdmin);

    // csrf for admin forms
    router.use(
        csurf({
            cookie: false,
        }),
    );

    // pass csrf token to templates
    router.use((req, res, next) => {
        res.locals.csrfToken = req.csrfToken();
        next();
    });

    router.get("/", (_req, res) => res.redirect("/admin/books"));

    router.get("/books", controller.list);
    router.get("/books/new", controller.newForm);
    router.post("/books", controller.create);

    router.get("/books/:id/edit", controller.editForm);
    router.post("/books/:id", controller.update);

    router.post("/books/:id/delete", controller.remove);

    return router;
}
