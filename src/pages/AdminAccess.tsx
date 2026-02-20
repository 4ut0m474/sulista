import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Hidden admin access page — reached via secret combo in LandingHeader
// Redirects to the admin panel under a default city entry point
const AdminAccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to admin panel using a standard entry point
    navigate("/city/PR/Curitiba/admin", { replace: true });
  }, [navigate]);

  return null;
};

export default AdminAccess;
