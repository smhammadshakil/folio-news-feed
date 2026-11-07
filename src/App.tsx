import { Route, Routes } from "react-router-dom";
import { FeedPage } from "./pages/FeedPage.tsx";

export function App() {
  return (
    <Routes>
      <Route path="*" element={<FeedPage />} />
    </Routes>
  );
}
