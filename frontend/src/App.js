import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CompressVideoFree from "./pages/seo/CompressVideoFree";
import ReduceVideoQuality from "./pages/seo/ReduceVideoQuality";
import CompressMp4Under25 from "./pages/seo/CompressVideoUnder25";
import UploadPage from "./pages/UploadTabs";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import AuthPage from "./pages/AuthPage";
import PrivacyPolicy from "./pages/Policy";
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
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/compress-video-online-free" element={<CompressVideoFree />} />
                    <Route path="/reduce-video-size-without-losing-quality" element={<ReduceVideoQuality />} />
                    <Route path="/compress-mp4-under-25mb" element={<CompressMp4Under25 />} />
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
