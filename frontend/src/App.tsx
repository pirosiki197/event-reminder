import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { EventDetail } from './pages/EventDetail';
import { EventForm } from './pages/EventForm';
import { EventList } from './pages/EventList';
import { TemplateEdit } from './pages/TemplateEdit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/templates/:templateId" element={<EventList />} />
        <Route path="/templates/:templateId/edit" element={<TemplateEdit />} />
        <Route path="/templates/:templateId/events/new" element={<EventForm />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/events/:eventId/edit" element={<EventForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
