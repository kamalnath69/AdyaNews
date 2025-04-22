import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { LockIcon, NewspaperIcon } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword } from "../../../redux/authSlice";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const dispatch = useDispatch();
    const { isLoading, error, message } = useSelector((state) => state.auth);
    const { token } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        // If loaded with token, we should stay on this page
        console.log("Reset password page mounted with token:", token);
        
        return () => {
            console.log("Reset password page unmounted");
        };
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            console.log("Submitting password reset with token:", token);
            await dispatch(resetPassword({ token, password })).unwrap();
            toast.success("Password reset successfully, redirecting to login page...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error("Password reset error:", error);
            toast.error(error || "Error resetting password");
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary-100 via-neutral-50 to-primary-200 overflow-hidden px-4 sm:px-0">
            <div
                className="relative z-10 w-full max-w-md rounded-3xl shadow-2xl border border-primary-100 px-4 sm:px-6 md:px-8 py-6 sm:py-8 flex flex-col justify-center mx-auto my-8 sm:my-12"
                style={{
                    background: "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(18px) saturate(1.5)",
                    WebkitBackdropFilter: "blur(18px) saturate(1.5)",
                    boxShadow: "0 8px 32px 0 rgba(80,120,255,0.13), 0 2px 8px 0 rgba(80,120,255,0.08)",
                }}
            >
                <div className="flex flex-col items-center mb-4">
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-1 sm:gap-2"
                    >
                        <NewspaperIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary-500 drop-shadow-lg" />
                        <span className="text-2xl sm:text-3xl font-extrabold text-primary-500 tracking-tight drop-shadow-lg">AdyaNews</span>
                    </motion.div>
                    <h2 className="mt-2 sm:mt-3 text-lg sm:text-xl font-bold text-neutral-900 text-center">
                        Reset Password
                    </h2>
                    <p className="text-neutral-500 text-center text-xs sm:text-sm mt-1">
                        Enter your new password below
                    </p>
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-3 w-full">
                    <InputField
                        id="password"
                        label="New Password"
                        type="password"
                        icon={<LockIcon className="w-5 h-5" />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputField
                        id="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                        icon={<LockIcon className="w-5 h-5" />}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={password !== confirmPassword && confirmPassword ? "Passwords do not match" : ""}
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 sm:py-3 px-4 bg-primary-500 text-white text-sm sm:text-base font-medium rounded-lg shadow hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Resetting..." : "Set New Password"}
                    </motion.button>
                </form>
            </div>
        </div>
    );
};

// Reusable InputField (copied from LoginPage)
const InputField = ({ id, label, type = "text", value, onChange, icon, error }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
        </label>
        <div className="mt-1 relative">
            <input
                id={id}
                name={id}
                type={type}
                required
                value={value}
                onChange={onChange}
                className="appearance-none block w-full px-3 py-2 pl-10 border border-neutral-300 rounded-lg shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
            />
            <div className="absolute left-3 top-2.5 text-neutral-400">{icon}</div>
        </div>
        {error && <p className="mt-1 text-xs sm:text-sm text-red-500">{error}</p>}
    </div>
);

export default ResetPasswordPage;
