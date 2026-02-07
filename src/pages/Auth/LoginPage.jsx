import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  Smartphone,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'phone'
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const validateForm = () => {
    if (loginMethod === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return false;
      }
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = email.replace(/\D/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        toast.error("Please enter a valid 10-digit phone number");
        return false;
      }
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const credentials =
        loginMethod === "email"
          ? { email, password, rememberMe }
          : { phone: email, password, rememberMe };

      const result = await login(credentials);

      if (result.success) {
        toast.success("Login successful!");

        // Determine destination based on role if no specific return url
        const isDefaultRedirect =
          from === "/" || from === "/login" || from === "/vendor/login";
        let destination = from;

        if (isDefaultRedirect) {
          switch (result.user.role) {
            case "vendor":
              destination = "/vendor/dashboard";
              break;
            default:
              destination = "/";
          }
        }

        navigate(destination, { replace: true });
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      student: { email: "student@campus.edu", password: "MockPass@123!" },
      vendor: { email: "cafe@campus.edu", password: "MockPass@123!" },
      // admin: { email: 'admin@campus.edu', password: 'MockPass@123!' }
    };

    if (role === "admin") {
      toast.error("Admin dashboard not implemented yet");
      return;
    }

    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);

    toast.success(`Demo ${role} credentials filled`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome back to FlowSync
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to skip the queue and pre-order your favorites
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          {/* Login Method Toggle */}
          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  loginMethod === "email"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  loginMethod === "phone"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Phone</span>
                </div>
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email/Phone Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {loginMethod === "email" ? "Email address" : "Phone number"}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loginMethod === "email" ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Smartphone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  id="email"
                  name="email"
                  type={loginMethod === "email" ? "email" : "tel"}
                  autoComplete={loginMethod === "email" ? "email" : "tel"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    loginMethod === "email" ? "you@campus.edu" : "9876543210"
                  }
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Try demo accounts
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleDemoLogin("student")}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Student
              </button>

              <button
                onClick={() => handleDemoLogin("vendor")}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Vendor
              </button>

              <button
                onClick={() => handleDemoLogin("admin")}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Admin
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8">
            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up for free
              </Link>
            </div>

            <div className="mt-2 text-center text-xs text-gray-500">
              <Link to="/vendor/login" className="hover:text-blue-600">
                Are you a vendor? Sign in here
              </Link>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-blue-700 font-medium">
                  Secure Login
                </p>
                <p className="text-xs text-blue-600">
                  Your data is protected with 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-800">
              AI-Powered Predictions
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              Accurate wait time predictions
            </p>
          </div>

          <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-800">Secure Payments</h4>
            <p className="text-xs text-gray-600 mt-1">
              PCI DSS compliant transactions
            </p>
          </div>

          <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-medium text-gray-800">Queue-Free Pickup</h4>
            <p className="text-xs text-gray-600 mt-1">
              Skip the wait, save time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
