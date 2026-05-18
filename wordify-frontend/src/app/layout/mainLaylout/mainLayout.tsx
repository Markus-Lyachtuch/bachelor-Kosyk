import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAtom } from "jotai";
import Sidebar from "widgets/sidebar";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import "./mainLayout.styl";


export const MainLayout = () => {
  const nav = useNavigate();
  const [session] = useAtom(sessionAtom);

  useEffect(() => {
    if (session === null) {
      nav('/auth');
    }
  }, [session, nav]);

  return (
    <div className="main-layout h-screen">
      <div className="no-scrollbar main-layout-left">
        <Sidebar />
      </div>

      <div className="no-scrollbar main-layout-right"> {/* no-scrollbar to fix flip cards x-scroll when we click to flip a card */}
        <Outlet />
      </div>
    </div>
  );
}
