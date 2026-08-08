import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex min-h-screen items-center justify-center px-6 text-white">
            <div className="rounded-3xl border border-white/10 bg-black/45 p-10 text-center shadow-2xl backdrop-blur-xl">
                <p className="text-sm tracking-[0.2em] text-red-400 uppercase">Error 404</p>
                <h1 className="mt-2 text-4xl font-extrabold">Page Not Found</h1>
                <p className="mt-3 text-zinc-400">
                    The page you are looking for does not exist or has moved.
                </p>
                <Link
                    to="/"
                    className="mt-6 inline-block rounded-xl bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;