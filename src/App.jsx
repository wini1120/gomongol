import React, { useState } from 'react';
import MainPage from './mainpage';
import ItineraryBuilder from './itinerarybuilder';
import Explorer from './explorer';

function App() {
  const [view, setView] = useState('main'); // 'main', 'builder', 'explorer'

  return (
    <div className="min-h-screen bg-gmg-bg font-sans">
      {view === 'main' && (
        <MainPage 
          onStartBuilder={() => setView('builder')} 
          onStartExplorer={() => setView('explorer')} 
        />
      )}
      {view === 'builder' && (
        <ItineraryBuilder onBack={() => setView('main')} />
      )}
      {view === 'explorer' && (
        <Explorer 
          onBack={() => setView('main')} 
          onStartBuilder={() => setView('builder')} 
        />
      )}
    </div>
  );
}

export default App;