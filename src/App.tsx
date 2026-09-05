import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Loans from "./pages/Loans";
import News from "./pages/News";
import Concept from "./pages/Concept";
import RiskMap from "./pages/RiskMap";
import Admin from "./pages/Admin";
import { LanguageProvider } from "./lib/i18n";
import { AuthProvider } from "./lib/auth";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col bg-earth-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<RiskMap />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/news" element={<News />} />
              <Route path="/concept" element={<Concept />} />
            </Routes>
          </main>
          <Footer />
          <Chatbot />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
