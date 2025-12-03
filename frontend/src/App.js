// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import UploadPage from "./pages/UploadTabs";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/auth" replace />;
    return children;
}

export default function App() {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <Navbar />

            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}
