import React from 'react';
import './App.css';
import SelectionBar from './components/SelectionBar';
import Maze from './components/Maze';

function App() {
  return (
    <div className='App'>
    <SelectionBar />
    <Maze />
    </div>
  );
}

export default App;
