import React from 'react'
import AdminLayout from './AdminLayout'

const AdminDashboard = () => {
  return (
    <div>
     <AdminLayout>
      <div className="row home1">
               <div className="col-sm-8 mx-auto  homep">
                <h1 className='ms-5 react'>Hareetech</h1>
                <h3 className='ms-5 learn'>Learn once, Write anyWhere</h3>
                <button className='btn btn-info ms-5 mt-4' > Get Started</button>
                
               </div>
               <div className="col-sm-4 homep">
               <img src="https://cdn3d.iconscout.com/3d/free/thumb/react-native-5562339-4642743.png" className='mt-5 img-center' alt="" />
               </div>
            </div>
      </AdminLayout>
    </div>
  )
}

export default AdminDashboard
