import React, { useState } from 'react';
import MainPage from './MainPage.jsx'; 
import ItineraryBuilder from './ItineraryBuilder.jsx';

function App() {
  const [view, setView] = useState('main'); // 'main' 또는 'builder'

  return (
    <>
      {view === 'main' ? (
        <MainPage onStartBuilder={() => setView('builder')} />
      ) : (
        <ItineraryBuilder onBack={() => setView('main')} />
      )}
    </>
  );
}

export default App;