'use client'

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NextAuthWrapper from '@/components/auth/NextAuthWrapper';

const CustomSignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/');
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username: email,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    setSocialLoading(provider);
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <NextAuthWrapper>
      <div className="milkyway-signin-page">
        <div className="milkyway-background">
          <div className="milkyway-stars"></div>
          <div className="orbital-rings">
            <div className="orbital-ring"></div>
            <div className="orbital-ring"></div>
            <div className="orbital-ring"></div>
          </div>
          <div className="milkyway-music-notes">
            <div className="music-note">🎵</div>
            <div className="music-note">🎶</div>
            <div className="music-note">🎸</div>
            <div className="music-note">🎹</div>
            <div className="music-note">🎺</div>
            <div className="music-note">🥁</div>
          </div>
        </div>
        
        <div className="signin-container">
          <div className="signin-card">
            {/* Header */}
            <div className="signin-header">
              <div className="logo-container">
                <div className="logo-icon">🎵</div>
                <div className="logo-glow"></div>
              </div>
              <h1>MilkyWay Music</h1>
              <p>Khám phá vũ trụ âm nhạc vô tận</p>
              <div className="header-decoration">
                <div className="decoration-line"></div>
                <div className="decoration-dot"></div>
                <div className="decoration-line"></div>
              </div>
            </div>

            {/* Form */}
            <div className={`signin-form ${isLoading ? 'loading' : ''}`}>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mật khẩu</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="signin-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-container">
                      <div className="loading-spinner">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                      </div>
                      <span className="loading-text">Đang đăng nhập...</span>
                    </div>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>
              </form>

              <div className="divider">
                <span>hoặc</span>
              </div>

              <div className="social-buttons">
                <button
                  type="button"
                  className="social-button github"
                  onClick={() => handleSocialSignIn('github')}
                  disabled={socialLoading === 'github'}
                >
                  {socialLoading === 'github' ? (
                    <div className="loading-container">
                      <div className="loading-spinner small">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                      </div>
                      <span>Đang đăng nhập...</span>
                    </div>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="social-icon">
                        <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      Đăng nhập với GitHub
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="social-button google"
                  onClick={() => handleSocialSignIn('google')}
                  disabled={socialLoading === 'google'}
                >
                  {socialLoading === 'google' ? (
                    <div className="loading-container">
                      <div className="loading-spinner small">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                      </div>
                      <span>Đang đăng nhập...</span>
                    </div>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="social-icon">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Đăng nhập với Google
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="signin-footer">
              <p>Chưa có tài khoản? <a href="/api/auth/signup">Đăng ký ngay</a></p>
            </div>
          </div>
        </div>
      </div>
    </NextAuthWrapper>
  );
};

export default CustomSignInPage;
