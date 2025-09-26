import { useState } from "react";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (amt <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const newTransaction = {
      userId: "test-user-123", // temporary; later use Cognito
      amount: amt,
      category,
      type,
    };

    try {
      const res = await fetch(
        "API_GATEWAY_INVOKE_URL_HERE/transactions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTransaction),
        }
      );

      if (!res.ok) {
        // backend returned error (e.g. 500)
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Network response was not ok");
      }

      const data = await res.json();
      // Lambda now returns the full transaction object
      setTransactions([data, ...transactions]);
      setAmount("");
      setCategory("");
    } catch (err) {
      console.error("❌ Error adding transaction:", err);
      alert("Failed to save transaction: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>TrackIt - Add Transaction</h1>

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

      <h2>Transactions</h2>
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

export default App;
