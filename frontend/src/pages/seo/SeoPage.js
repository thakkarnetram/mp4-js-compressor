import React from "react";
import { Helmet } from "react-helmet-async";
import UploadCard from "../UploadTabs";
import Pricing from "../../components/Pricing";
import FAQ from "../../components/FAQ";
import { Link, useLocation } from "react-router-dom";

export default function SeoPage({ heading, intro, title, description }) {
    const location = useLocation();
    const canonicalUrl = `https://tinycompression.online${location.pathname}`;

    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-auto">

            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />

                <link rel="canonical" href={canonicalUrl} />

                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="website" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>

            <section className="flex justify-center py-12 px-4">
                <div className="w-full max-w-3xl">
                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        {heading}
                    </h1>
                    <p className="text-slate-300 text-center text-sm md:text-base max-w-2xl mx-auto mb-6">
                        {intro}
                    </p>

                    <UploadCard />
                </div>
            </section>

            <Pricing />
            <FAQ />

            <footer className="text-center text-slate-500 py-6 border-t border-slate-800">
                © {new Date().getFullYear()} TinyCompression. All rights reserved.
                <br />
                <Link to="/privacy" className="hover:text-blue-400 transition-colors">
                    Privacy Policy
                </Link>
            </footer>
        </div>
    );
}
