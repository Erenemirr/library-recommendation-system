import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { validateEmail, validateRequired } from '@/utils/validation';
import { handleApiError, showSuccess } from '@/utils/errorHandling';

interface LocationState {
  email?: string;
}

export function ConfirmSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const [email, setEmail] = useState(state?.email || '');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<{ email?: string; code?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const validate = (): boolean => {
    const newErrors: { email?: string; code?: string } = {};

    if (!validateRequired(email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!validateRequired(code)) {
      newErrors.code = 'Verification code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      showSuccess('Account verified. You can sign in now.');
      navigate('/login');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!validateRequired(email)) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Invalid email format' });
      return;
    }

    setIsResending(true);
    try {
      await resendSignUpCode({ username: email });
      showSuccess('Verification code resent. Check your email.');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animated-bg">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 11c0-2.761 2.239-5 5-5s5 2.239 5 5-2.239 5-5 5H9a4 4 0 110-8h1"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="gradient-text">Verify Account</span>
          </h1>
          <p className="text-slate-600 text-lg">
            Enter the verification code sent to your email
          </p>
        </div>

        <div className="glass-effect rounded-3xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleConfirm}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              placeholder="you@example.com"
            />

            <Input
              label="Verification Code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              error={errors.code}
              required
              placeholder="123456"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Confirm Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-violet-600 hover:text-violet-700 font-semibold"
              disabled={isResending}
            >
              {isResending ? 'Resending code...' : 'Resend verification code'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              Already verified?{' '}
              <Link to="/login" className="text-violet-600 hover:text-violet-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
