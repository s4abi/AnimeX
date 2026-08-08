import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    const navLinkClass = (path) =>
        `block rounded-lg px-3 py-2.5 text-sm transition md:inline-block md:py-2 ${location.pathname === path
            ? "bg-red-600/25 text-red-300 font-semibold ring-1 ring-red-500/30"
            : "text-zinc-200 hover:bg-white/5 hover:text-white"
        }`;

    return (
        <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-zinc-950/75 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150">
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-3.5">
                <Link to="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-950/50 ring-1 ring-white/10">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M8 5v14l11-7L8 5z" />
                        </svg>
                    </span>
                    <span className="font-display text-2xl tracking-[0.06em] text-white md:text-[1.65rem]">
                        ANIMEX
                    </span>
                </Link>

                <div className="hidden items-center gap-1 md:flex md:gap-0.5">
                    <Link to="/" className={navLinkClass("/")}>Home</Link>
                    <Link to="/browse" className={navLinkClass("/browse")}>Browse</Link>
                    {user && (
                        <Link to="/watchlist" className={navLinkClass("/watchlist")}>Watchlist</Link>
                    )}
                    {user && (
                        <Link to="/profile" className={navLinkClass("/profile")}>Profile</Link>
                    )}
                    {user?.role === "admin" && (
                        <Link to="/admin" className={navLinkClass("/admin")}>Admin</Link>
                    )}
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    {user && (
                        <span className="mr-1 max-w-[140px] truncate text-xs text-zinc-500" title={user.email}>
                            {user.name}
                        </span>
                    )}
                    {!user ? (
                        <>
                            <Link
                                to="/login"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/5 hover:text-white"
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/signup"
                                className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-950/40 transition hover:from-red-500 hover:to-red-400"
                            >
                                Join free
                            </Link>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-500/40 hover:bg-red-600/20"
                        >
                            Sign out
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white md:hidden"
                    aria-expanded={open}
                    aria-label={open ? "Close menu" : "Open menu"}
                    onClick={() => setOpen((v) => !v)}
                >
                    {open ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </nav>

            {open && (
                <div className="border-t border-white/10 bg-zinc-950/95 px-4 py-4 md:hidden">
                    <div className="flex flex-col gap-1">
                        <Link to="/" className={navLinkClass("/")}>Home</Link>
                        <Link to="/browse" className={navLinkClass("/browse")}>Browse</Link>
                        {user && (
                            <Link to="/watchlist" className={navLinkClass("/watchlist")}>Watchlist</Link>
                        )}
                        {user && (
                            <Link to="/profile" className={navLinkClass("/profile")}>Profile</Link>
                        )}
                        {user?.role === "admin" && (
                            <Link to="/admin" className={navLinkClass("/admin")}>Admin</Link>
                        )}
                    </div>
                    <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                        {!user ? (
                            <>
                                <Link
                                    to="/login"
                                    className="rounded-xl border border-white/15 py-3 text-center text-sm font-semibold"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-center text-sm font-semibold"
                                >
                                    Join free
                                </Link>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={logout}
                                className="w-full rounded-xl border border-white/15 py-3 text-sm font-semibold"
                            >
                                Sign out
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
