import AuthPage from "@/components/auth/AuthPage";

const AdminLogin = () => {
  return (
    <AuthPage 
      fixedRole="admin" 
      title="Admin Control Terminal" 
      subtitle="Enter your secure credentials to access the administrative nexus." 
    />
  );
};

export default AdminLogin;
