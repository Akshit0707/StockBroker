'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import type { LoginFormData } from '@/src/utils/validation';
import { useLogin } from '@/src/hooks/login';

const Login: React.FC = () => {
  const { handleLogin, isSubmitting, errors } = useLogin();
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleLogin(formData);
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <div style={styles.gridBg} aria-hidden="true" />
      <div style={styles.orb} aria-hidden="true" />

      <Link
        href="/"
        style={styles.backBtn}
        className="auth-back-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Home
      </Link>

      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span style={styles.brandName}>TraderSuite</span>
        </div>
        
        <div style={styles.heading}>Welcome back</div>
        <div style={styles.subheading}>Sign in to your trading account</div>

        {errors.general && (
          <div style={styles.errorBanner}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input
                className="auth-input"
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={styles.input}
              />
            </div>
            {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                className="auth-input"
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span style={styles.fieldError}>{errors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-submit-btn"
            style={styles.submitBtn}
          >
            {isSubmitting ? (
              <>
                <span style={styles.spinner} />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account?{' '}
          <Link href="/auth/register" style={styles.link}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

const css = `
  @keyframes auth-fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes auth-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes orb-pulse {
    0%, 100% { transform: scale(1); opacity: 0.35; }
    50%       { transform: scale(1.08); opacity: 0.5; }
  }
  .auth-input:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.18) !important;
    outline: none;
  }
  .auth-submit-btn:hover:not(:disabled) {
    background: #818cf8 !important;
    transform: translateY(-1px);
    box-shadow: 0 0 24px rgba(99,102,241,0.45) !important;
  }
  .auth-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .auth-back-btn {
    transition: all 0.2s ease;
  }
  .auth-back-btn:hover {
    background: rgba(99,102,241,0.15) !important;
    transform: translateX(-2px);
  }
`;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    top: '-10%',
    right: '-5%',
    width: 480,
    height: 480,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
    animation: 'orb-pulse 6s ease-in-out infinite',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 440,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 20,
    padding: '40px 40px 36px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    animation: 'auth-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
  },
  brandName: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    marginBottom: 28,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#ef4444',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.01em',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    color: 'var(--text-muted)',
    display: 'flex',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 38px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    padding: 2,
  },
  fieldError: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 2,
  },
  submitBtn: {
    marginTop: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '13px 20px',
    background: 'var(--accent-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
    letterSpacing: '0.01em',
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'auth-spin 0.7s linear infinite',
    display: 'inline-block',
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
    color: 'var(--text-secondary)',
  },
  link: {
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    fontWeight: 600,
  },
  backBtn: {
    position: 'fixed',
    top: 20,
    left: 20,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 10,
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.2s, border-color 0.2s',
    fontFamily: 'var(--font-body)',
  },
};

export default Login;