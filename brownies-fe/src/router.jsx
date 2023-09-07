import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/layout";
import CreateTopic from "./pages/CreateTopic";
import Search from "./pages/Search";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="/create-topic" element={<CreateTopic />} />
      <Route path="/:topic" element={<Search />} />
    </Route>
  )
);

export default router;
