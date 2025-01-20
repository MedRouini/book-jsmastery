import React from "react";

const Page = () => {
  return (
    <main className="root-container flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-bebas-neue text-5xl font-bold text-light-100">
        Whoa, Slow down there, Speedy!
      </h1>
      <p className="mt-3 max-w-xl text-center text-light-400">
        You're navigating too fast. Take a breather and try again in a few
      </p>
    </main>
  );
};

export default Page;
