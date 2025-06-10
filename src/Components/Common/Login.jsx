<div className="card-footer mt-3">
  <div className="d-flex justify-content-between align-items-center mb-2">
    <p className="mb-0">
      Not registered?{" "}
      <Link to="/register" onClick={onClose}>
        Signup
      </Link>
    </p>
    <p className="mb-0">
      <FaLock className="me-1" />
      <Link
        to="/forgot-password"
        onClick={onClose}
        style={{ textDecoration: "none", color: "#0d6efd", fontWeight: "500" }}
      >
        Forgot Password?
      </Link>
    </p>
  </div>

  <div className="d-flex justify-content-end gap-2">
    <button type="button" className="btn btn-secondary" onClick={onClose}>
      Cancel
    </button>
    <button type="submit" className="btn btn-primary">
      Login
    </button>
  </div>
</div>
