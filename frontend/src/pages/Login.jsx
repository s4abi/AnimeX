import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
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
            const res = await api.post("/auth/login", formData);
            login(res.data.user, res.data.token);
            navigate("/");
        } catch (error) {
            setMessage(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen text-white">
            <Navbar />
            <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-6xl lg:grid-cols-2">
                <div className="relative hidden overflow-hidden lg:block">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&q=80)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-black/70 to-red-950/80" />
                    <div className="relative flex h-full flex-col justify-end p-12">
                        <p className="font-display text-5xl leading-none tracking-wide text-white">Unlimited stories.</p>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-300">
                            One account. Your watchlist, recommendations, and progress sync everywhere you stream.
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <h2 className="mb-2 font-display text-4xl tracking-wide text-white">Welcome back</h2>
                    <p className="mb-6 text-sm text-zinc-400">Sign in to pick up where you left off.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
                        />

                        <button className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-500 py-4 font-semibold text-white transition hover:from-red-500 hover:to-red-400">
                            Sign In
                        </button>
                    </form>

                    {message && <p className="mt-4 text-sm text-red-400">{message}</p>}
                </div>
                </div>
            </div>
        </div>
    );
};

export default Login;