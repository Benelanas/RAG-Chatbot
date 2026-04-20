import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import classes from "../styles/login.module.css";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  // Check for success message from registration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
      setError(message);
      setMessageType("success"); // Registration success messages are green
    }
  }, []);

  async function handleSubmit(e){
    e.preventDefault();
    setError("");
    setMessageType("");
    setLoading(true);

    try {
      const result = await login(usernameOrEmail, password);
      
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Login failed');
        setMessageType("error");
      }
    } catch (err) {
      setError('An error occurred during login');
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.loginContainer}>
      <div className={classes.loginForm}>
        <div className={classes.signupGrid} style={{
          backgroundImage: 'url(/loginimg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 1
          }}></div>
          
          <div className={classes.formContent} style={{ position: 'relative', zIndex: 2 }}>
            <div className={classes.formHeader} style={{
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: '600',
                margin: '0',
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                Welcome Back to Lumino
              </h1>
            </div>
            
            <div className={classes.welcomeMessage} style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              <p style={{
                fontSize: '1rem',
                lineHeight: '1.5',
                margin: 0,
                fontWeight: '300',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
              }}>
                Sign in to continue your AI chat experience
              </p>
            </div>
          </div>
        </div>

        {/* Right Grid - Login Form */}
        <div className={classes.loginGrid}>
          <div className={classes.formContent}>
            <div className={classes.formHeader}>
              <h1>Welcome to <span>Login Lumino!</span></h1>
            </div>

            <form onSubmit={handleSubmit} className={classes.form}>
              <div className={classes.inputGroup}>
                <div className={classes.inputWrapper}>
                  <svg className={classes.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 8.5,16.5 10,16.5C11.5,16.5 12.5,17.38 12.93,18.28C12.05,18.71 11.05,19 10,19C8.95,19 7.95,18.71 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 10,14.5C6.54,14.5 3.07,15.09 1.64,16.83C2.68,14.6 5.78,13 10,13C14.22,13 17.32,14.6 18.36,16.83M12,6A3,3 0 0,0 9,9A3,3 0 0,0 12,12A3,3 0 0,0 15,9A3,3 0 0,0 12,6M12,11A2,2 0 0,1 10,9A2,2 0 0,1 12,7A2,2 0 0,1 14,9A2,2 0 0,1 12,11Z"/></svg>
                  <input
                    type="text"
                    placeholder="Enter your username or email"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className={classes.input}
                    required
                  />
                </div>
              </div>

              <div className={classes.inputGroup}>
                <div className={classes.inputWrapper}>
                  <svg className={classes.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/></svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={classes.input}
                    required
                  />
                  <button
                    type="button"
                    className={classes.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      {showPassword ? (
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                      ) : (
                        <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L3.28,3L21.72,21.44L20.44,22.71L2,4.27M5.55,5.73L7.12,7.3C7.41,6.56 7.94,5.94 8.61,5.5C9.29,5.07 10.08,4.86 10.88,4.86C11.68,4.86 12.47,5.07 13.15,5.5C13.82,5.94 14.35,6.56 14.64,7.3L16.21,5.73C15.72,4.81 14.89,4.1 13.88,3.7C12.87,3.3 11.78,3.1 10.68,3.1C9.58,3.1 8.49,3.3 7.48,3.7C6.47,4.1 5.64,4.81 5.15,5.73H5.55Z"/>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {error && (
                <div className={`${classes.message} ${messageType === "success" ? classes.successMessage : classes.errorMessage}`}>
                  {error}
                </div>
              )}

              <button type="submit" className={classes.submitButton} disabled={loading}>
                {loading ? 'Signing In...' : 'Sign in'}
              </button>
            </form>

            <div className={classes.formFooter}>
              <p className={classes.modePrompt}>
                Don't have an account? 
                <Link href="/register" className={classes.link}>
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}