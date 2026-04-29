import { Navigate, useLocation } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import LoadingSpinner from "../LoadingSpinner";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = UserAuth();
  const location = useLocation();

  // This check is critical - session will be undefined before supabase updates it to null or with session info
  // This if statement prevents users who are actually logged in from getting kicked back to home menu before supabase SDK updates session variable.
  if (session === undefined) {
    return (
      <div className="home-container">
        <div className="content-center-card">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return <>{session ? <>{children}</> : <Navigate to={`/signin?next=${encodeURIComponent(location.pathname)}`} replace />}</>;
};

export default PrivateRoute;
