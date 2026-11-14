
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SignUp from "./pages/SignUp";
import Suppliers from "./pages/Suppliers";
import LowStock from "./pages/LowStock";
import ProductCatalogue from "./pages/ProductCatalogue";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/signup" element={<SignUp />} />

        <Route element={<Layout />}>
          <Route path="/" element={<div className="p-8 text-2xl font-bold text-primary">Dashboard</div>} />
          <Route path="/products" element={<ProductCatalogue />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/low-stock" element={<LowStock />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
