import AuthPage from "@/components/auth/AuthPage";

const PassengerLogin = () => {
  return (
    <AuthPage 
      fixedRole="user" 
      title="Access Neural Grid" 
      subtitle="Login as a Passenger to dynamically track the arrival time and live routes." 
    />
  );
};

export default PassengerLogin;
