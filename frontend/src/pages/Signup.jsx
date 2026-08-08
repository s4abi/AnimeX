import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import api from "../services/api";

const Signup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
                setMessage("All fields are required");
                return;
            }

            if (formData.password.length < 6) {
                setMessage("Password must be at least 6 characters");
                return;
            }

            const res = await api.post("/auth/register", formData);
            setMessage(res.data.message || "Account created successfully");
            navigate("/login");
        } catch (error) {
            setMessage(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen text-white">
            <Navbar />
            <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-6xl lg:grid-cols-2">
                <div className="relative hidden overflow-hidden lg:block">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-bl from-black via-black/75 to-red-950/70" />
                    <div className="relative flex h-full flex-col justify-end p-12">
                        <p className="font-display text-5xl leading-none tracking-wide text-white">Join the premiere.</p>
                        <p className="mt-3 max-w-sm text-sm text-zinc-300">
                            Create a free profile and build your personal watchlist in seconds.
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <h2 className="mb-2 font-display text-4xl tracking-wide">Create account</h2>
                    <p className="mb-6 text-sm text-zinc-400">Start watching in minutes.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password (minimum 6 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
                        />

                        <button className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-500 py-4 font-semibold transition hover:from-red-500 hover:to-red-400">
                            Create Account
                        </button>
                    </form>

                    {message && (
                        <p className={`mt-4 text-sm ${message.toLowerCase().includes("success") || message.toLowerCase().includes("created") ? "text-green-400" : "text-red-400"}`}>
                            {message}
                        </p>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;