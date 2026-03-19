import AuthPage from "@/components/auth/AuthPage";

const DriverLogin = () => {
  return (
    <AuthPage 
      fixedRole="driver" 
      title="Driver Authorization" 
      subtitle="Sign in to initialize live fleet tracking and receive your allocated active route." 
    />
  );
};

export default DriverLogin;
