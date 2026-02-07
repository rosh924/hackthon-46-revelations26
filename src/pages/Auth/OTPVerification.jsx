import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Mail,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [verificationMethod, setVerificationMethod] = useState('email'); // 'email' or 'sms'
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'success', 'failed'

  const inputRefs = useRef([]);

  const { email = 'user@example.com', phone = '9876543210' } = location.state || {};

  // Format phone number for display
  const formattedPhone = phone ? 
    `${phone.slice(0, 5)}****${phone.slice(-2)}` : 
    '*******';

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split('').forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      // Focus the last filled input
      const lastFilledIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastFilledIndex].focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setVerificationStatus('pending');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification
      if (otpString === '123456') {
        setVerificationStatus('success');
        toast.success('Account verified successfully!');
        
        // Navigate after success
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setVerificationStatus('failed');
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setVerificationStatus('failed');
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) {
      toast.error(`Please wait ${timeLeft} seconds before resending`);
      return;
    }

    setIsResending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(60);
      setVerificationStatus('pending');
      
      toast.success(`New OTP sent to your ${verificationMethod}`);
      
      // Focus first input
      inputRefs.current[0].focus();
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const toggleVerificationMethod = () => {
    setVerificationMethod(prev => prev === 'email' ? 'sms' : 'email');
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(60);
    setVerificationStatus('pending');
    
    toast.info(`OTP will be sent to your ${verificationMethod === 'email' ? 'phone' : 'email'}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Link
          to="/register"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Register
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Verify Your Account
        </h2>
        <p className="mt-2 text-center text-gray-600">
          Enter the verification code sent to your {verificationMethod}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100">
          {/* Verification Method Info */}
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {verificationMethod === 'email' ? (
                    <Mail className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Code sent to {verificationMethod === 'email' ? 'email' : 'phone'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {verificationMethod === 'email' ? email : formattedPhone}
                  </p>
                </div>
              </div>
              
              <button
                onClick={toggleVerificationMethod}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Switch to {verificationMethod === 'email' ? 'SMS' : 'Email'}
              </button>
            </div>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter 6-digit verification code
            </label>
            
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-14 h-14 text-3xl text-center font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    verificationStatus === 'failed' 
                      ? 'border-red-300 bg-red-50' 
                      : digit 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                  disabled={isLoading || verificationStatus === 'success'}
                />
              ))}
            </div>

            {/* Status Messages */}
            {verificationStatus === 'success' && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Verified successfully!</span>
              </div>
            )}
            
            {verificationStatus === 'failed' && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Invalid code. Please try again.</span>
              </div>
            )}
          </div>

          {/* Timer and Resend */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Code expires in: <span className="font-bold">{formatTime(timeLeft)}</span>
                </span>
              </div>
              
              <button
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || isResending}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Verify Button */}
          <div className="mb-6">
            <button
              onClick={handleVerify}
              disabled={isLoading || verificationStatus === 'success' || otp.join('').length !== 6}
              className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                  Verifying...
                </>
              ) : verificationStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  Verified! Redirecting...
                </>
              ) : (
                'Verify Account'
              )}
            </button>
          </div>

          {/* Manual Entry Option */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or verify manually</span>
              </div>
            </div>
            
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter full code here"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const value = e.target.value.slice(0, 6);
                  if (/^\d*$/.test(value)) {
                    const newOtp = value.split('');
                    while (newOtp.length < 6) newOtp.push('');
                    setOtp(newOtp);
                  }
                }}
                value={otp.join('')}
              />
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code? Check your spam folder or{' '}
              <button
                onClick={toggleVerificationMethod}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                try another method
              </button>
            </p>
          </div>

          {/* Security Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Secure Verification</p>
                <p className="text-xs text-gray-600 mt-1">
                  This code expires in 10 minutes and can only be used once.
                  Never share your verification code with anyone.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Back to Login
            </Link>
          </div>
        </div>

        {/* Demo OTP */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="text-center">
            <p className="text-sm font-medium text-yellow-800">Demo OTP: 123456</p>
            <p className="text-xs text-yellow-600 mt-1">
              Use this code for testing purposes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;