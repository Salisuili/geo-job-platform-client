import React from 'react';
import { Link } from 'react-router-dom';

function SignUp() {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      
      {/* Sign Up Form */}
      <div className="container d-flex flex-grow-1 justify-content-center align-items-center py-5">
        <div className="w-100" style={{ maxWidth: '500px' }}>
          <div className="text-center mb-4">
            <h2 className="fw-bold">Create your account</h2>
          </div>
          <form>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Full Name"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="Email"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Password"
                required
              />
            </div>

            <div className="mb-3 d-flex justify-content-around">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="laborer"
                  required
                />
                <label className="form-check-label" htmlFor="laborer">
                  I'm a laborer
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="employer"
                  required
                />
                <label className="form-check-label" htmlFor="employer">
                  I'm an employer
                </label>
              </div>
            </div>

            <div className="d-grid mb-3">
              <button className="btn btn-primary btn-lg">Sign Up</button>
            </div>

            <p className="text-center text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-decoration-underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
