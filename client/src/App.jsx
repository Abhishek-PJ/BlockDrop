import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  FileHistory,
  ApplicationPage,
  ApplicationLayout,
  HomeLayout,
  Landing,
  UserProfilePage,
  FileDownload,
  Aboutus,
  VerifyFile, // ✅ good now
} from "./pages";

import { ToastContainer } from "react-toastify";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "app",
        element: <ApplicationLayout />,
        children: [
          { index: true, element: <ApplicationPage /> },
          { path: "user-profile", element: <UserProfilePage /> },
        ],
      },
      {
        path: "download",
        element: <FileDownload />
      },
      {
        path: "Aboutus",
        element: <Aboutus />,
      },
      {
        path:"file-history",
        element: <FileHistory />
      }, 
      { 
        path: "verify-file",
        element: <VerifyFile />
      }

    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-center" />
    </>
  );
}

export default App;
