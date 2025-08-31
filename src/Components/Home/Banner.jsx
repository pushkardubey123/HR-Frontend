import React from "react";

const Banner = () => {
  return (
    <div>
      <>
        <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 flex md:flex-row flex-col my-10">
          <div className="w-full md:w-1/2 md:mt-32 mt-12 order-2 md:order-1">
            <div className="space-y-12">
              <h1 className="text-4xl font-bold">
                Hello,Welcome to{" "}
                <span className="text-slate-500">HareetecH Development</span>
              </h1>
              <h4 className="text-xl">
                We're not here to Compete
                <br />
                We are here to Lead
              </h4>
            </div>
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2 mt-5">
            <img
              src="https://stdigital.in/public/assets/front/img/ddex-gateway-img.png"
              alt=""
              className="w-92 h-92"
            />
          </div>
        </div>
      </>
    </div>
  );
};

export default Banner;
