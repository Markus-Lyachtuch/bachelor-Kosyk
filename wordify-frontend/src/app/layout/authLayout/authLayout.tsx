import AuthLeftImg from "shared/assets/images/authLeftImg.webp";
import { Outlet } from "react-router-dom";

import "./authLayout.styl";

export const AuthLayout = () => {
  return (
    <div className="auth flex-y-center h-screen">
      <div className="auth-left">
        <img src={AuthLeftImg} alt="auth left" />
      </div>
      <div className="auth-right">
        <Outlet />
      </div>
    </div>
  );
};
