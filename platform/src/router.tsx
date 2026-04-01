import { createHashRouter, Outlet } from "react-router-dom";
import App from "./App";
import Signup from "./components/authentication/Signup";
import Signin from "./components/authentication/Signin";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/authentication/PrivateRoute";
import Explore from "./components/Explore";
import { AuthContextProvider } from "./context/AuthContext";
// @ts-ignore
import Navbar from "@homepage/components/Navbar";
// @ts-ignore
import HomepageExplore from "@homepage/pages/Explore";
// @ts-ignore
import About from "@homepage/pages/About";
// @ts-ignore
import Contact from "@homepage/pages/Contact";
import "@fontsource/michroma";
import "@fontsource/anta";

const AuthLayout = () => (
  <AuthContextProvider>
    <Outlet />
  </AuthContextProvider>
);

const SiteLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

export const router = createHashRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          { path: "/", element: <App /> },
          { path: "/explore", element: <HomepageExplore /> },
          { path: "/about", element: <About /> },
          { path: "/contact", element: <Contact /> },
        ],
      },
      { path: "/signup", element: <Signup /> },
      { path: "/signin", element: <Signin /> },
      { path: "/engine", element: <Explore /> },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
