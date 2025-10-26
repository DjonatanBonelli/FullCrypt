import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";

export default function Page() {
  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <RegisterForm />
      <hr style={{ margin: "20px 0" }} />
      <LoginForm />
    </div>
  );
}
