import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { verifyEmail } from "../../../redux/authSlice";
import { NewspaperIcon } from "lucide-react";

const EmailVerificationPage = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { error, isLoading } = useSelector((state) => state.auth);

    const handleChange = (index, value) => {
        const newCode = [...code];
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                newCode[i] = pastedCode[i] || "";
            }
            setCode(newCode);
            const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
            inputRefs.current[focusIndex].focus();
        } else {
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join("");
        try {
            await dispatch(verifyEmail(verificationCode)).unwrap();
            navigate("/");
            toast.success("Email verified successfully");
        } catch (error) {
            toast.error(error.message || "Error verifying email");
        }
    };

    useEffect(() => {
        if (code.every((digit) => digit !== "")) {
            handleSubmit(new Event("submit"));
        }
        // eslint-disable-next-line
    }, [code]);

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
                        <NewspaperIcon className="h-10 w-10 text-primary-500 drop-shadow-lg" />
                        <span className="text-3xl font-extrabold text-primary-500 tracking-tight drop-shadow-lg">AdyaNews</span>
                    </motion.div>
                    <h2 className="mt-3 text-xl font-bold text-neutral-900 text-center">
                        Verify Your Email
                    </h2>
                    <p className="text-neutral-500 text-center text-sm mt-1">
                        Enter the 6-digit code sent to your email address.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 w-full">
                    <div className="flex justify-center space-x-1 sm:space-x-2 md:space-x-3">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 text-center text-sm sm:text-lg md:text-xl font-bold bg-white/80 text-primary-700 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none transition"
                            />
                        ))}
                    </div>
                    {error && <p className="text-red-500 font-semibold mt-2 text-center">{error}</p>}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={code.join("").length !== 6 || isLoading}
                        className={`mt-6 w-full py-2.5 sm:py-3 md:py-4 rounded-xl text-sm sm:text-base font-medium transition-colors ${
                            code.join("").length === 6 && !isLoading
                                ? "bg-primary-500 text-white hover:bg-primary-600"
                                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        }`}
                        type="submit"
                    >
                        {isLoading ? "Verifying..." : "Verify Email"}
                    </motion.button>
                </form>
            </div>
        </div>
    );
};
export default EmailVerificationPage;
