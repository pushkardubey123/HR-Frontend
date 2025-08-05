import React, { useEffect } from 'react'
import Navbar from '../Common/Navbar'
import Banner from './Banner'
import Footer from './Footer'

const Home = () => {
  useEffect(() => {
  fetch("https://hr-backend-m6c4.onrender.com");
}, []);
  return (
    <>
    <Navbar/>
   <Banner/>
    </>
  )
}

export default Home
