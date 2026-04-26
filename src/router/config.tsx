import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Home = lazy(() => import("../pages/home/page"));
const BookingPage = lazy(() => import("../pages/booking/page"));
const PaymentPage = lazy(() => import("../pages/payment/page"));
const BlogPage = lazy(() => import("../pages/blog/page"));
const PostPage = lazy(() => import("../pages/blog/PostPage"));
const AdminPage = lazy(() => import("../pages/admin/page"));
const NotFound = lazy(() => import("../pages/NotFound"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/booking",
    element: <BookingPage />,
  },
  {
    path: "/blog",
    element: <BlogPage />,
  },
  {
    path: "/blog/:slug",
    element: <PostPage />,
  },
  {
    path: "/payment",
    element: <PaymentPage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
