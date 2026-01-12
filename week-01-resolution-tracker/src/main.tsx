import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import WeeklyProjects from "./pages/WeeklyProjects.tsx";
import WeekInfo from "./pages/WeekInfo.tsx";
import Layout from "./components/Layout.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/weekly-projects" element={<WeeklyProjects />} />
        <Route path="/weekly-projects/week-:weekNum" element={<WeekInfo />} />
        <Route path="/week-01/*" element={<App />} />
        <Route path="/about" element={<div className="placeholder-page"><h1>About</h1><p>Coming soon</p></div>} />
        <Route path="/contact" element={<div className="placeholder-page"><h1>Contact</h1><p>Coming soon</p></div>} />
      </Routes>
    </Layout>
  </BrowserRouter>
);
