import React from "react";
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
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
