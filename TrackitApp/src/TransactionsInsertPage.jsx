import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

function TransactionsInsertPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    initializeUser();
  }, []);

  async function initializeUser() {
    try {
      const user = await getCurrentUser();
      setUserId(user.userId);
      setUserEmail(user.signInDetails?.loginId || user.username);
    } catch (error) {
      console.error("Error getting user:", error);
      navigate("/");
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (amt <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const newTransaction = {
      userId: userId,
      amount: amt,
      category,
      type,
    };

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      const res = await fetch(
        `${import.meta.env.VITE_AWS_APIGATEWAY_URL}/transactions`,
        {
          method: "POST",
          headers: {
            Authorization: idToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTransaction),
        }
      );

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Network response was not ok");
      }

      const data = await res.json();
      setTransactions([data, ...transactions]);
      setAmount("");
      setCategory("");
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("Failed to save transaction: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>TrackIt - Add Transaction</h1>
        <div>
          <span style={{ marginRight: "15px" }}>Welcome, {userEmail}</span>
          <button onClick={handleLogout} style={{ padding: "8px 16px" }}>
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleAddTransaction} style={{ marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ marginRight: "10px" }}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button type="submit">Add</button>
      </form>
      <Link to="/dashboard">Go to Dashboard</Link>
      <h2>Recent Transactions</h2>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.type.toUpperCase()}: ${t.amount} - {t.category} (
            {new Date(t.timestamp).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionsInsertPage;