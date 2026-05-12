'use client';

const FreePlanPage = () => {
  return (
    <div className="bg-background relative w-full break-words py-3 px-3 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm sm:shadow-md dark:shadow-none dark:sm:shadow-dark-md">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">You are currently on the Free Plan</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Enjoy the basic features of our service.</p>
          <a
            href="/dashboard/plan/upgrade"
            className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Upgrade Your Plan
          </a>
      </div>
    </div>
  );
};

export default FreePlanPage;