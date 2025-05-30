import { motion } from "framer-motion";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Loader, MailIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../../redux/authSlice";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await dispatch(forgotPassword(email)).unwrap();
            setIsSubmitted(true);
        } catch (error) {
            // Check if the error is for an unverified user
            if (error && typeof error === 'object' && error.needsVerification) {
                toast.error("Please verify your email before resetting your password");
                
                // Add this redirect with context parameter
                setTimeout(() => {
                    navigate(`/verify-email?email=${encodeURIComponent(error.email)}&context=resetPassword`);
                }, 1500);
            }
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
                        className="flex items-center gap-2"
                    >
                        <MailIcon className="h-10 w-10 text-primary-500 drop-shadow-lg" />
                        <span className="text-3xl font-extrabold text-primary-500 tracking-tight drop-shadow-lg">AdyaNews</span>
                    </motion.div>
                    <h2 className="mt-3 text-xl font-bold text-neutral-900 text-center">
                        Forgot Password
                    </h2>
                    <p className="text-neutral-500 text-center text-sm mt-1">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>
                
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-3 w-full">
                        <InputField
                            id="email"
                            label="Email Address"
                            type="email" 
                            icon={<MailIcon className="w-5 h-5" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-2.5 sm:py-3 px-4 bg-primary-500 text-white text-sm sm:text-base font-medium rounded-lg shadow hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader className="size-5 sm:size-6 animate-spin mx-auto" /> : "Send Reset Link"}
                        </motion.button>
                    </form>
                ) : (
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <MailIcon className="h-8 w-8 text-white" />
                        </motion.div>
                        <p className="text-neutral-700 mb-6">
                            If an account exists for {email}, you will receive a password reset link shortly.
                        </p>
                    </div>
                )}
                <div className="mt-4 text-center">
                    <Link to={"/login"} className="text-sm text-primary-500 hover:underline flex items-center justify-center">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Reusable InputField (copied from LoginPage)
const InputField = ({ id, label, type = "text", value, onChange, icon, error }) => (
    <div className="mb-3 sm:mb-4">
        <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">
            {label}
        </label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                {icon}
            </div>
            <input
                id={id}
                name={id}
                type={type}
                required
                value={value}
                onChange={onChange}
                className="appearance-none block w-full px-3 py-2 pl-10 text-xs sm:text-sm border border-neutral-300 rounded-lg shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export default ForgotPasswordPage;
