import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Anmelden</h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
          Melden Sie sich an, um auf Ihre personalisierten Trainingseinheiten zuzugreifen
        </p>
      </div>
      
      <LoginForm />
    </div>
  );
};

export default LoginPage;