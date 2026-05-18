import "app/styles/index.styl";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { AuthLayout } from "app/layout/authLayout";
import { MainLayout } from "app/layout/mainLaylout";

import { HomePage } from "pages/homePage";
import { MainPage } from "pages/mainPage";
import { LoginPage } from "pages/loginPage";
import { StudyPage } from "pages/studyPage";
import { ProfilePage } from "pages/profilePage";
import { RegisterPage } from "pages/registerPage";

import { SetPage } from "pages/setPage";
import { StudySet } from "pages/studySetPage";
import { FullPageSet } from "pages/fullSetPage";
import { EditSetPage } from "pages/editSetPage";
import { FoldersPage } from "pages/foldersPage";
import { CreateSetPage } from "pages/createSetPage";
import { StudySetResultsPage } from "pages/studySetResultsPage";
import { ConfirmEmailPage } from "pages/confirmEmailPage";
import { ForgetPasswordPage } from "pages/forgetPasswordPage";
import { SearchPage } from "pages/searchPage";
import { SavedPage } from "pages/savedPage";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        path: "",
        element: <MainPage />,
      },
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="login" replace />,
          },
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
          {
            path: "confirm-email",
            element: <ConfirmEmailPage />,
          },
          {
            path: "forget-password",
            element: <ForgetPasswordPage />,
          }
        ],
      },
    ],
  },
  {
    path: "/home",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "saved",
        element: <SavedPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "study",
        element: <StudyPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />
      },
      {
        path: "folders",
        element: <FoldersPage />,
      },
      {
        path: "folders/:id",
        element: <SetPage />,
      },
      {
        path: "folders/:id/sets/:setId",
        element: <FullPageSet />,
      },
      {
        path: "sets/create",
        element: <CreateSetPage />,
      },
      {
        path: "sets/edit/:id",
        element: <EditSetPage />,
      },
      {
        path: "folders/:id/sets/:setId/study",
        element: <StudySet />,
      },
      {
        path: "folders/:id/sets/:setId/study/results",
        element: <StudySetResultsPage />,
      }
    ],
  },
]);

export default function AppRouter() {
  return (
    <div className="app light">
      <RouterProvider router={router} />
    </div>
  );
}
