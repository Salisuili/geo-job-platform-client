import React from "react";
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <header className="d-flex justify-content-between align-items-center border-bottom px-4 py-3 bg-white shadow-sm">
        <div className="d-flex align-items-center gap-2 text-dark">
          <div className="me-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 48 48"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" />
            </svg>
          </div>
          <h2 className="h5 fw-bold mb-0">WorkConnect</h2>
        </div>
        <div className="d-flex align-items-center gap-4">
          <a href="#" className="text-dark text-decoration-none fw-medium">
            Find Work
          </a>
          <a href="#" className="text-dark text-decoration-none fw-medium">
            Find Workers
          </a>
          <Link to="/signup" className="btn btn-outline-secondary fw-bold px-4">
  Sign-Up
</Link>

        </div>
      </header>

      <main className="flex-grow-1 d-flex justify-content-center align-items-center px-4 py-5">
        <div className="w-100" style={{ maxWidth: "480px" }}>
          <h2 className="text-center fw-bold mb-4">Welcome back</h2>
          <form>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-medium">
                Username or email
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="email"
                placeholder="Enter your username or email"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-medium">
                Password
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                id="password"
                placeholder="Enter your password"
              />
            </div>

            <div className="mb-3 text-end">
              <a href="#" className="text-decoration-underline text-muted small">
                Forgot password?
              </a>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg fw-bold">
                Log in
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
