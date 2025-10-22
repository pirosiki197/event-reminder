import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { EventEdit } from './pages/EventEdit';
import { HoldingDetail } from './pages/HoldingDetail';
import { HoldingEdit } from './pages/HoldingEdit';
import { HoldingForm } from './pages/HoldingForm';
import { HoldingList } from './pages/HoldingList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events/:eventId" element={<HoldingList />} />
        <Route path="/events/:eventId/edit" element={<EventEdit />} />
        <Route path="/events/:eventId/holdings/new" element={<HoldingForm />} />
        <Route path="/holdings/:holdingId" element={<HoldingDetail />} />
        <Route path="/holdings/:holdingId/edit" element={<HoldingEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
