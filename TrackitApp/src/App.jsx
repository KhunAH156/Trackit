import "./App.css";

export default function App() {
  const handleLogin = () => {
    alert('Login button clicked!');
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="heading">TrackIt</h1>
        <button onClick={handleLogin} className="login-button">
          Login
        </button>
      </div>
    </div>
  );
}