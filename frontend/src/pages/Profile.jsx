import Navbar from "../components/common/Navbar";
import { useAuth } from "../hooks/useAuth";

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen text-white">
            <Navbar />
            <div className="mx-auto max-w-3xl p-6">
                <h1 className="mb-4 text-4xl font-extrabold">Profile</h1>
                {user && (
                    <div className="space-y-4 rounded-3xl border border-white/10 bg-black/35 p-6">
                        <p className="text-zinc-300">
                            <span className="font-semibold text-white">Name:</span> {user.name}
                        </p>
                        <p className="text-zinc-300">
                            <span className="font-semibold text-white">Email:</span> {user.email}
                        </p>
                        <p className="text-zinc-300">
                            <span className="font-semibold text-white">Role:</span> {user.role}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;