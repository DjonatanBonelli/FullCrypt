import RegisterForm from "../../components/login/RegisterForm";
import LoginForm from "../../components/login/LoginForm";

export default function Page() {
  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <RegisterForm />
      <hr style={{ margin: "20px 0" }} />
      <LoginForm />
    </div>
  );
}
