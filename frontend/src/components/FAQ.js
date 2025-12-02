import React, { useState } from "react";

export default function FAQ() {
    const faqs = [
        {
            q: "Is TinyCompression free to use?",
            a: "Yes! You can compress individual videos and images for free. A Pro version will offer bulk compression and faster speeds."
        },
        {
            q: "What file types are supported?",
            a: "Currently we support MP4 videos and PNG/JPG images. More formats will be added soon."
        },
        {
            q: "What is CRF?",
            a: "CRF (Constant Rate Factor) controls video quality. Lower CRF = higher quality & larger size. Higher CRF = smaller size with lower quality."
        },
        {
            q: "Does TinyCompression store my files?",
            a: "No. All uploads are processed instantly and deleted automatically. Your data stays private."
        },
        {
            q: "Why is desktop compression faster than web?",
            a: "On desktop we use your device's CPU directly, which is faster. Online compression depends on internet upload speed and server limits."
        },
        {
            q: "Can I compress large files like 1GB videos?",
            a: "Yes! As long as your browser or device can handle the upload, we can compress it. Desktop version recommended for huge files."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (i) => {
        setOpenIndex(openIndex === i ? null : i);
    };

    return (
        <section id="faq" className="bg-slate-900 text-white py-16 px-6 border-t border-slate-800">
            <h2 className="text-3xl font-semibold text-center mb-10">Frequently Asked Questions</h2>

            <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((item, i) => (
                    <div
                        key={i}
                        className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer"
                        onClick={() => toggle(i)}
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">{item.q}</h3>
                            <span className="text-blue-400 text-xl">
                                {openIndex === i ? "-" : "+"}
                            </span>
                        </div>

                        {openIndex === i && (
                            <p className="text-slate-300 mt-3 leading-relaxed">{item.a}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
