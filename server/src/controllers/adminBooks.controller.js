import { z } from "zod";

const BookFormSchema = z.object({
    title: z.string().trim().min(1, "Title is required."),
    author: z.string().trim().min(1, "Author is required."),
    isbn: z.string().trim().min(1, "ISBN is required."),
    category: z.string().trim().min(1, "Category is required."),
});

function toFormValues(body) {
    return {
        title: typeof body?.title === "string" ? body.title : "",
        author: typeof body?.author === "string" ? body.author : "",
        isbn: typeof body?.isbn === "string" ? body.isbn : "",
        category: typeof body?.category === "string" ? body.category : "",
    };
}

function normalizeServiceError(err) {
    // map errors so templates can display them
    if (err?.statusCode === 409 || err?.status === 409) {
        return {
            flashMessage: err?.message || "Conflict.",
            fieldErrors: { isbn: ["ISBN already exists."] },
            status: 409,
        };
    }

    return {
        flashMessage: "Please fix the errors below.",
        fieldErrors: {},
        status: 400,
    };
}

export function adminBooksController({ books }) {
    return {
        // GET /admin/books?q=&category=
        list: async (req, res) => {
            const q = typeof req.query.q === "string" ? req.query.q : "";
            const category =
                typeof req.query.category === "string"
                    ? req.query.category
                    : "";

            const filters = {
                q: q.trim() ? q.trim() : undefined,
                category:
                    category.trim() && category.trim() !== "all"
                        ? category.trim()
                        : undefined,
            };

            const [items, categories] = await Promise.all([
                books.list({
                    q: filters.q,
                    category: filters.category,
                    limit: 200,
                    offset: 0,
                }),
                books.categories(),
            ]);

            const viewItems = (items ?? []).map((b) => ({
                ...b,
                id: String(b?._id ?? b?.id ?? ""),
            }));

            return res.render("admin/books/index", {
                pageTitle: "Admin - Books",
                items: viewItems,
                categories,
                filters: { q, category: category || "all" },
                csrfToken: res.locals.csrfToken,
                flash: res.locals.flash,
            });
        },

        // GET /admin/books/new
        newForm: async (_req, res) => {
            return res.render("admin/books/new", {
                pageTitle: "Admin - New Book",
                values: { title: "", author: "", isbn: "", category: "" },
                errors: {},
                csrfToken: res.locals.csrfToken,
                flash: res.locals.flash,
            });
        },

        // POST /admin/books
        create: async (req, res) => {
            const values = toFormValues(req.body);

            try {
                const data = BookFormSchema.parse(values);
                await books.create({ book: data });

                req.flash?.("success", "Book created.");
                return res.redirect("/admin/books");
            } catch (err) {
                if (err?.name === "ZodError") {
                    const errors = err.flatten().fieldErrors;
                    req.flash?.("error", "Please fix the errors below.");
                    return res.status(400).render("admin/books/new", {
                        pageTitle: "Admin - New Book",
                        values,
                        errors,
                        csrfToken: res.locals.csrfToken,
                        flash: res.locals.flash,
                    });
                }

                const mapped = normalizeServiceError(err);
                req.flash?.("error", mapped.flashMessage);
                return res.status(mapped.status).render("admin/books/new", {
                    pageTitle: "Admin - New Book",
                    values,
                    errors: mapped.fieldErrors,
                    csrfToken: res.locals.csrfToken,
                    flash: res.locals.flash,
                });
            }
        },

        // GET /admin/books/:id/edit
        editForm: async (req, res) => {
            const { id } = req.params;
            const book = await books.getById({ id });

            return res.render("admin/books/edit", {
                pageTitle: "Admin - Edit Book",
                bookId: id,
                values: {
                    title: book.title ?? "",
                    author: book.author ?? "",
                    isbn: book.isbn ?? "",
                    category: book.category ?? "",
                },
                errors: {},
                csrfToken: res.locals.csrfToken,
                flash: res.locals.flash,
            });
        },

        // POST /admin/books/:id
        update: async (req, res) => {
            const { id } = req.params;
            const values = toFormValues(req.body);

            try {
                const data = BookFormSchema.parse(values);
                await books.update({ id, patch: data });

                req.flash?.("success", "Book updated.");
                return res.redirect("/admin/books");
            } catch (err) {
                if (err?.name === "ZodError") {
                    const errors = err.flatten().fieldErrors;
                    req.flash?.("error", "Please fix the errors below.");
                    return res.status(400).render("admin/books/edit", {
                        pageTitle: "Admin - Edit Book",
                        bookId: id,
                        values,
                        errors,
                        csrfToken: res.locals.csrfToken,
                        flash: res.locals.flash,
                    });
                }

                const mapped = normalizeServiceError(err);
                req.flash?.("error", mapped.flashMessage);
                return res.status(mapped.status).render("admin/books/edit", {
                    pageTitle: "Admin - Edit Book",
                    bookId: id,
                    values,
                    errors: mapped.fieldErrors,
                    csrfToken: res.locals.csrfToken,
                    flash: res.locals.flash,
                });
            }
        },

        // POST /admin/books/:id/delete
        remove: async (req, res) => {
            const { id } = req.params;
            await books.remove({ id });

            req.flash?.("success", "Book deleted.");
            return res.redirect("/admin/books");
        },
    };
}
