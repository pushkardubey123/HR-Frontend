import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AdminSubscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/subscription/price?modules=attendance,leave,project&duration=1month`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setPlans([
        { name: "1 Month Plan", duration: "1month", price: res.data.price },
        { name: "6 Month Plan", duration: "6month", price: res.data.price * 5.7 },
        { name: "1 Year Plan", duration: "1year", price: res.data.price * 10.8 },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan) => {
    const user = JSON.parse(localStorage.getItem("user"));
    Swal.fire({
      title: `Subscribe to ${plan.name}?`,
      text: `Price: ₹${plan.price}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Subscribe",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const resp = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/subscription/subscribe`,
            {
              modules: ["attendance", "leaves", "projects"],
              duration: plan.duration,
              paymentRef: "manual",
            },
            { headers: { Authorization: `Bearer ${user?.token}` } }
          );
          Swal.fire("Success", resp.data.message, "success");
        } catch (err) {
          Swal.fire("Error", "Subscription failed", "error");
        }
      }
    });
  };

  if (loading)
    return <div className="p-10 text-center">Loading available plans...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Choose Your Subscription Plan
      </h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {plans.map((plan, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-gray-600">Duration: {plan.duration}</p>
            <p className="text-lg font-bold text-green-600 mt-3">
              ₹{plan.price}
            </p>
            <button
              onClick={() => handleSubscribe(plan)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSubscription;
