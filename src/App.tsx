import { Route, Routes } from "react-router-dom";
import { FeedPage } from "./pages/FeedPage.tsx";
import { StoryPage } from "./pages/StoryPage.tsx";

export function App() {
  return (
    <Routes>
      <Route path="/story" element={<StoryPage />} />
      <Route path="*" element={<FeedPage />} />
    </Routes>
  );
}
