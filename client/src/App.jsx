import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  FileHistory,
  ApplicationPage,
  ApplicationLayout,
  HomeLayout,
  Landing,
  UserProfilePage,
  FileDownload,
  Aboutus
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
        path: "/app",
        element: <ApplicationLayout />,
        children: [
          { path: "/app", element: <ApplicationPage /> },
          { path: "/app/file-history", element: <FileHistory /> },
          { path: "/app/user-profile", element: <UserProfilePage /> }
        ],
      },
      {
        path: "/download",
        element: <FileDownload />
      },
      {
        path: "/Aboutus",
        element: <Aboutus/>,
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
