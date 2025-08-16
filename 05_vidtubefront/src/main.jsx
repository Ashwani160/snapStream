import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import Login from './pages/Login.jsx';
import User from './pages/UserPage.jsx';
import Register from './pages/Register.jsx';
import UsersList from './pages/UsersList.jsx';
import Layout from './Layout.jsx';
import Videos from './pages/Videos.jsx';
import VideoPlayer from './pages/videoPlayer.jsx';
import UploadVideo from './pages/VideoUpload.jsx';

const router = createBrowserRouter([
  {
    path:"/",
    Component: Layout,
    children:[
      {
        path: "/login",
        Component: Login
      },
      {
        path: '/user',
        Component: User
      },
      {
        path: '/register',
        Component: Register 
      },
      {
        path: '/allusers',
        Component: UsersList
      },
      {
        path: '/videos',
        Component: Videos
      },
      {
        path: '/videos/:id',
        Component: VideoPlayer
      },
      {
        path: '/uploadvideo',
        Component: UploadVideo
      }
    ]
  }
  
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
