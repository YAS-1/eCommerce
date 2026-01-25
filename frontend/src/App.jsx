import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import Navbar from './components/Navbar.jsx'
import { Toaster } from 'react-hot-toast'
import { useUserStore } from '../src/stores/useUserStore'
import LoadingSpinner from './components/LoadingSpinner.jsx'


const App = () => {

  const { user, checkAuth, checkingAuth } = useUserStore();


  // checking if the user is authenticated
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // render spinner while checking auth
  if (checkingAuth) return <LoadingSpinner />

  return (
    <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
      {/* Background */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute pointer-events-none top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
        </div>
      </div>

      {/*Routes*/}
      <div className='relative z-50 pt-20'>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={ !user ? <LoginPage /> : <HomePage />} />
          <Route path="/signup" element={ !user ? <SignUpPage /> : <HomePage />} />
        </Routes>
      </div>
      <Toaster/>
    </div>
  )
}

export default App
