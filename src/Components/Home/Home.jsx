import React from 'react'
import Navbar from '../Common/Navbar'
import Banner from './Banner'
import Footer from './Footer'

const Home = () => {
  useEffect(() => {
  fetch("https://backend-hrms-k73a.onrender.com/");
}, []);
  return (
    <>
   <Banner/>
    </>
  )
}

export default Home
