import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import './styles.css';


const RootComponent = () => {
  const theme = 'dark'; 

  useEffect(() => {
    const rootClassName = `theme-${theme}`;
    document.body.classList.add(rootClassName); 
  }, [theme]);

  return <App />;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RootComponent /> {/* Используем новый компонент для установки темы */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
