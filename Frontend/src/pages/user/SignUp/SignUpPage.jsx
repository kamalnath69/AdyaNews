import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NewspaperIcon, UserIcon, MailIcon, LockIcon, ArrowRightIcon } from "lucide-react";
import { signup } from "../../../redux/authSlice";
import PasswordStrengthMeter from "../../../components/auth/PasswordStrengthMeter";
import toast from "react-hot-toast";
import { 
  fetchPublicNews,
  getInitialCardPositions,
  CARD_COLORS,
  CARD_WIDTH,
  CARD_HEIGHT 
} from "../../../utils/newsUtils";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [news, setNews] = useState([]);
  const [positions, setPositions] = useState([]);
  const [formRect, setFormRect] = useState(null);
  const formRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  // Fetch news using the utility function
  useEffect(() => {
    let mounted = true;
    
    const getNews = async () => {
      const articles = await fetchPublicNews(2, 16);
      if (mounted) setNews(articles);
    };
    
    getNews();
    return () => { mounted = false; };
  }, []);

  // Get form rect for physics
  useEffect(() => {
    const updateRect = () => {
      if (formRef.current) {
        setFormRect(formRef.current.getBoundingClientRect());
      }
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  // Initialize card positions when news or formRect changes
  useEffect(() => {
    if (news.length && formRect) {
      setPositions(getInitialCardPositions(news.length, formRect));
    }
  }, [news, formRect]);

  // Physics: random movement if inside form, attraction to cursor if outside (2.2 speed)
  useEffect(() => {
    if (!positions.length) return;
    let animation;
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, insideForm: false, moved: false };
    let lastMove = Date.now();

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.moved = true;
      lastMove = Date.now();
      if (formRect) {
        mouse.insideForm =
          e.clientX > formRect.left &&
          e.clientX < formRect.right &&
          e.clientY > formRect.top &&
          e.clientY < formRect.bottom;
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    const step = () => {
      setPositions((prev) => {
        const now = Date.now();
        const next = prev.map((card, i) => {
          let { left, top, vx, vy, rotate } = card;

          if (mouse.insideForm) {
            // Random movement at speed 1.5
            vx += (Math.random() - 0.5) * 1.7;
            vy += (Math.random() - 0.5) * 1.7;
          } else {
            // Attract to cursor at speed 2.2
            const dx = mouse.x - (left + CARD_WIDTH / 2);
            const dy = mouse.y - (top + CARD_HEIGHT / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 30) {
              vx += (dx / dist) * 3.5;
              vy += (dy / dist) * 3.5;
            }
          }

          // Repel from other cards
          for (let j = 0; j < prev.length; j++) {
            if (i === j) continue;
            const other = prev[j];
            const dx = (left + CARD_WIDTH / 2) - (other.left + CARD_WIDTH / 2);
            const dy = (top + CARD_HEIGHT / 2) - (other.top + CARD_HEIGHT / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CARD_WIDTH * 0.95 && dist > 1) {
              vx += (dx / dist) * 6.5;
              vy += (dy / dist) * 6.5;
            }
          }

          // Damping
          vx *= 0.82;
          vy *= 0.82;

          // Move
          left += vx * 0.28;
          top += vy * 0.28;

          // Keep in bounds
          left = Math.max(8, Math.min(left, window.innerWidth - CARD_WIDTH - 8));
          top = Math.max(8, Math.min(top, window.innerHeight - CARD_HEIGHT - 8));

          // Gentle rotation
          rotate += (Math.random() - 0.5) * 1.2;

          return { left, top, vx, vy, rotate };
        });
        return next;
      });
      animation = requestAnimationFrame(step);
    };
    animation = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animation);
    };
  }, [positions.length, formRect]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await dispatch(
        signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        })
      ).unwrap();
      navigate("/verify-email");
    } catch (error) {
      // error handled by redux
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary-100 via-neutral-50 to-primary-200 overflow-hidden">
      {/* News Cards - fill the background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <AnimatePresence>
          {news.map((article, idx) => {
            const card = positions[idx] || { left: 50, top: 50, rotate: 0 };
            const color = CARD_COLORS[idx % CARD_COLORS.length];
            
            // Hide some cards on mobile
            const isVisibleOnMobile = idx < 6;
            // Hide more cards on tablet
            const isVisibleOnTablet = idx < 10;
            
            return (
              <motion.div
                key={article.title + idx}
                animate={{
                  opacity: 0.93,
                  scale: 1,
                  left: card.left,
                  top: card.top,
                  rotate: card.rotate,
                }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
                whileHover={{
                  scale: 1.07,
                  boxShadow: "0 8px 32px 0 rgba(80, 120, 255, 0.18)",
                  zIndex: 30,
                }}
                className={`absolute ${color} shadow-xl border border-primary-100 rounded-2xl flex flex-col items-stretch justify-between overflow-hidden cursor-pointer transition-all backdrop-blur-[2px]
                  ${isVisibleOnMobile ? '' : 'hidden sm:flex'} 
                  ${isVisibleOnTablet ? '' : 'hidden md:flex'}`}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  minWidth: 150,
                  minHeight: 80,
                  maxWidth: 320,
                  maxHeight: 180,
                  zIndex: 2 + idx,
                  pointerEvents: "auto",
                  userSelect: "none",
                }}
                onClick={() =>
                  toast("Sign up to continue", {
                    icon: "🔒",
                    style: {
                      background: "#22223b",
                      color: "#fff",
                      borderRadius: "10px",
                      fontWeight: "bold",
                    },
                    duration: 2500,
                  })
                }
              >
                <div className="flex-1 flex flex-col justify-between">
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-20 object-cover object-center rounded-t-xl"
                      style={{
                        borderBottom: "1px solid #e0e7ff",
                        filter: "grayscale(0.08) contrast(1.09)",
                        minHeight: 40,
                      }}
                    />
                  )}
                  <div className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/80 text-primary-700 px-2 py-0.5 rounded-full font-semibold shadow">
                        {article.source || "News"}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {article.date ? new Date(article.date).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <span className="font-bold text-neutral-800 text-xs line-clamp-2">{article.title}</span>
                    <span className="text-xs text-neutral-500 line-clamp-2">{article.description || article.body}</span>
                  </div>
                  <div className="flex justify-end px-3 pb-2">
                    <a
                      href={article.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline font-semibold"
                      style={{ pointerEvents: "auto" }}
                    >
                      Read More →
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Signup Card - centered */}
      <div
        ref={formRef}
        className="relative z-10 w-full max-w-md rounded-3xl shadow-2xl border border-primary-100 px-4 sm:px-6 md:px-8 py-6 md:py-8 flex flex-col justify-center mx-4 sm:mx-auto my-8 sm:my-12"
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
            <NewspaperIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary-500 drop-shadow-lg" />
            <span className="text-2xl sm:text-3xl font-extrabold text-primary-500 tracking-tight drop-shadow-lg">AdyaNews</span>
          </motion.div>
          <h2 className="mt-3 text-xl font-bold text-neutral-900 text-center">
            Create your account
          </h2>
          <p className="text-neutral-500 text-center text-sm mt-1">
            Stay updated with the latest news as you join!
          </p>
        </div>
        <form className="space-y-3 w-full" onSubmit={handleSignUp} autoComplete="off">
          <InputField
            id="name"
            label="Full Name"
            icon={<UserIcon className="w-5 h-5" />}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />
          <InputField
            id="email"
            label="Email Address"
            type="email"
            icon={<MailIcon className="w-5 h-5" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            icon={<LockIcon className="w-5 h-5" />}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
          />
          <PasswordStrengthMeter password={formData.password} />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-primary-500 text-white font-bold rounded-lg shadow-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition duration-200"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 mr-1" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              <>
                Sign Up <ArrowRightIcon className="w-4 h-4 ml-1" />
              </>
            )}
          </motion.button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-neutral-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-500 hover:underline font-medium">
              Login
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

// Reusable InputField component
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
        className="appearance-none block w-full px-3 py-2 pl-10 border border-neutral-300 rounded-lg shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
      />
      <div className="absolute left-3 top-2.5 text-neutral-400">{icon}</div>
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export default SignUpPage;