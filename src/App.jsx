import React, { useState } from 'react';
import MainPage from './mainpage'; // 소문자로 변경
import ItineraryBuilder from './itinerarybuilder'; // 소문자로 변경

function App() {
  const [view, setView] = useState('main');

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