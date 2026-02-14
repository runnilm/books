import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "@/auth/auth";
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout";
import { AccountPage } from "@/pages/AccountPage";
import { BookDetailPage } from "@/pages/BookDetailPage";
import { BooksPage } from "@/pages/BooksPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/app/books" replace />} />

            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route
                path="/app"
                element={
                    <RequireAuth>
                        <AuthenticatedLayout />
                    </RequireAuth>
                }
            >
                <Route index element={<Navigate to="books" replace />} />
                <Route path="books" element={<BooksPage />} />
                <Route path="books/:id" element={<BookDetailPage />} />
                <Route path="account" element={<AccountPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/app/books" replace />} />
        </Routes>
    );
}
