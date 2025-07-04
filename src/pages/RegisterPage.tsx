import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Konto erstellen</h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
          Erstellen Sie ein Konto, um auf personalisierte Trainingseinheiten für Ihren Hund zuzugreifen
        </p>
      </div>
      
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;