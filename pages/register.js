import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/register.module.css";
import Link from "next/link";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmedPassword: ""
  });
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordError("");

    if (formData.password !== formData.confirmedPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Registration successful, redirect to login
        router.push('/login?message=Registration successful! Please login.');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        {/* Left side - Register Form */}
        <div className={styles.formSection}>
          <div className={styles.formContent}>
            <div className={styles.formHeader}>
              <h1>Welcome to <span>Sign Up Lumino!</span></h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                  </svg>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                  </svg>
                  <input
                    type="password"
                    name="confirmedPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmedPassword}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
              {error && <p className={styles.errorMessage}>{error}</p>}

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className={styles.formFooter}>
              <p className={styles.modePrompt}>
                Already have an account? 
                <Link href="/login" className={styles.link}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Welcome Message */}
        <div className={styles.welcomeSection}>
          <div className={styles.formContent}>
            <div className={styles.formHeader}>
              <h1>Welcome to <span>Lumino!</span></h1>
            </div>
            <div className={styles.welcomeMessage}>
              <p>Join our community and start your AI chat journey today!</p>
              <p>Create your account to:</p>
              <ul>
                <li>Save your chat history</li>
                <li>Access your conversations</li>
                <li>Personalize your experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
