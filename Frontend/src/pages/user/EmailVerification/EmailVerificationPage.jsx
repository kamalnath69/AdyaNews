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
        <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary-100 via-neutral-50 to-primary-200 overflow-hidden">
            <div
                className="relative z-10 w-full max-w-md rounded-3xl shadow-2xl border border-primary-100 px-8 py-8 flex flex-col justify-center mx-auto my-12"
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
                    <div className="flex justify-between">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-2xl font-bold bg-white/80 text-primary-700 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none transition"
                            />
                        ))}
                    </div>
                    {error && <p className="text-red-500 font-semibold mt-2 text-center">{error}</p>}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading || code.some((digit) => !digit)}
                        className="w-full bg-primary-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 transition"
                    >
                        {isLoading ? "Verifying..." : "Verify Email"}
                    </motion.button>
                </form>
            </div>
        </div>
    );
};
export default EmailVerificationPage;
