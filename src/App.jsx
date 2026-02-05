import React, { useState } from 'react';
import MainPage from './MainPage';
import ItineraryBuilder from './ItineraryBuilder';

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