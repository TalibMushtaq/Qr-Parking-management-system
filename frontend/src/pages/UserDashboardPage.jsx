import React, { useState } from "react";
import UserDashboard from "../components/UserDashboard";

const UserDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <UserDashboard setIsLoading={setIsLoading} />
    </>
  );
};

export default UserDashboardPage;
