import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PlacementsPage } from './components/PlacementsPage';
import { ImmobilierPage } from './components/ImmobilierPage';
import { ComptesPage } from './components/ComptesPage';
import { CreditsPage } from './components/CreditsPage';
import { HistoriquePage } from './components/HistoriquePage';
import { ObjectifsPage } from './components/ObjectifsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { FiscalPage } from './components/FiscalPage';
import { ConnectionsPage } from './components/ConnectionsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'placements':
        return <PlacementsPage />;
      case 'immobilier':
        return <ImmobilierPage />;
      case 'comptes':
        return <ComptesPage />;
      case 'credits':
        return <CreditsPage />;
      case 'historique':
        return <HistoriquePage />;
      case 'objectifs':
        return <ObjectifsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'fiscal':
        return <FiscalPage />;
      case 'connections':
        return <ConnectionsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;