// Uncomment this line to use CSS modules
// import styles from './app.module.css';

//app.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryProvider } from '../providers/QueryProvider';
import Homepage from '../components/Homepage';
import DocumentDetail from '../components/DocumentDetail';

export function App() {
  return (
    <QueryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
        </Routes>
      </Router>
    </QueryProvider>
  );
}

export default App;
