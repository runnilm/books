import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { BooksPage } from "@/pages/BooksPage";
import { BookDetailPage } from "@/pages/BookDetailPage";
import { AccountPage } from "@/pages/AccountPage";
import { LibraryPage } from "@/pages/LibraryPage";

export const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/app/books" replace /> },

    { path: "/app/login", element: <LoginPage /> },
    { path: "/app/register", element: <RegisterPage /> },

    {
        path: "/app",
        element: (
            <ProtectedRoute>
                <AppShell />
            </ProtectedRoute>
        ),
        children: [
            { path: "books", element: <BooksPage /> },
            { path: "books/:id", element: <BookDetailPage /> },
            { path: "library", element: <LibraryPage /> },
            { path: "account", element: <AccountPage /> },
            { index: true, element: <Navigate to="/app/books" replace /> },
        ],
    },

    { path: "*", element: <Navigate to="/app/books" replace /> },
]);
