import { useEffect, useState } from "react";
import "./App.css";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

function App() {
  const [balance, setBalance] = useState({
    total_balance: 0,
    total_credit: 0,
    total_debit: 0,
  });
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");
  const [comment, setComment] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState({ next: null, previous: null });
  const [editId, setEditId] = useState(null);
  const [totalTrans, setTotalTrans] = useState(0);

  const fetchData = async (pageNumber = 1) => {
    try {
      // fetch transaction with pagination
      const tranRes = await fetch(
        `${BASE_URL}/transactions/?page=${pageNumber}`,
      );
      const tranData = await tranRes.json();

      setTransactions(tranData.results || []);
      setTotalTrans(tranData.count || 0)
      setHasMore({ next: tranData.next, previous: tranData.previous });
      setCurrentPage(pageNumber);

      // card data
      const res = await fetch(`${BASE_URL}/dashboard/`);
      const data = await res.json();
      setBalance(data);
    } catch (error) {
      console.error("fetching data error", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlerSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { amount, transaction_type: type, comment };
      if(editId) {
        await fetch(`${BASE_URL}/transactions/${editId}/`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data)
        })

        setEditId(null);
      }
      else {
        await fetch(`${BASE_URL}/transactions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      }
      
      setAmount("");
      setComment("");
      setType("CREDIT");
      fetchData();
    } catch (error) {
      console.error("create data error", error);
    }
  };

  const handlerEdit = (transaction) => {
    setEditId(transaction.id);
    setAmount(transaction.amount);
    setComment(transaction.comment);
    setType(transaction.transaction_type);
  };

  const cancelEdit = () => {
    setEditId(null);
    setAmount('');
    setComment('');
    setType('CREDIT');
  }

  const handlerDelete = async (id) => {

    if(!window.confirm('Are you sure you want to delete'))
      return;

    try {
      await fetch(`${BASE_URL}/transactions/${id}/`, {
        method: 'DELETE',
      });

      fetchData();

    } catch (error) {
      console.log('Deleting transaction Error', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* header */}
      <header className="bg-gray-200 p-6 border-b border-b-gray-300">
        <div>
          <h1 className="font-semibold text-2xl text-gray-800">
            Transaction Track Dashboard
          </h1>
        </div>
      </header>

      {/* 3 card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
        <div className="border border-blue-500 p-2 bg-white shadow-md rounded-md">
          <h2 className="font-semibold text-xl text-blue-500">
            Available Balance
          </h2>
          <p>Rs. {balance.total_balance}</p>
        </div>
        <div className="border border-green-500 p-2 bg-white shadow-md rounded-md">
          <h2 className="font-semibold text-xl text-green-500">Total Credit</h2>
          <p>Rs. {balance.total_credit}</p>
        </div>
        <div className="border border-red-500 p-2 bg-white shadow-md rounded-md">
          <h2 className="font-semibold text-xl text-red-500">Total Debit</h2>
          <p>Rs. {balance.total_debit}</p>
        </div>
      </div>

      {/* form */}
      <div className="p-6">
        <div className="bg-white p-6 shadow-md rounded-md border  border-gray-100">
          <h1 className="font-semibold text-xl text-gray-700 mb-2">
            {editId ? "Edit Transaction" : "Add Transaction"}
          </h1>
          <form
            action=""
            onSubmit={handlerSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
          >
            <div className="flex justify-center items-center space-x-2">
              <label htmlFor="amount" className="font-semibold">
                Amount:
              </label>
              <input
                type="text"
                name="amount"
                value={amount}
                id="amount"
                placeholder="e.g. 500"
                required
                autoFocus
                onChange={(e) => setAmount(e.target.value)}
                className="border rounded-sm border-gray-400 focus:ring-2 focus:ring-blue-500 outline-none px-1"
              />
            </div>
            <div className=" flex justify-center items-center space-x-2">
              <label htmlFor="" className="font-semibold">
                Type:
              </label>
              <select
                name="type"
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border rounded-sm border-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>
            </div>
            <div className=" flex justify-center items-center space-x-2">
              <label htmlFor="" className="font-semibold">
                Comment:
              </label>
              <input
                name="comment"
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Description..."
                className="border border-gray-400 rounded-sm w-full outline-none focus:ring-2 focus:ring-blue-500 px-1"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-gray-100 py-1 rounded-md hover:bg-blue-700 cursor-pointer transition"
              >
                {editId ? "Updated Transaction" : "Save Transaction"}
              </button>
              {editId && (
                <button onClick={cancelEdit} className="w-full text-white cursor-pointer bg-gray-700 p-1 rounded-md hover:bg-gray-400 transition">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* table */}
      <div className="p-6 flex flex-col justify-center">
        <div className="bg-white p-6 rounded-md shadow-md mb-2">
          <h2 className="font-semibold text-xl text-gray-700 mb-2">
            Transaction History <span className="py-1 px-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full">{totalTrans}</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-2 text-sm font-semibold text-gray-700">
                    Sr No.
                  </th>
                  <th className="p-2 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="p-2 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="p-2 text-sm font-semibold text-gray-700">
                    Comment
                  </th>
                  <th className="p-2 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="p-2 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className="border-b hover:bg-gray-100 transition"
                  >
                    <td className="p-2 text-sm text-center">{index + 1}</td>
                    <td className="p-2 text-sm text-gray-600 text-center">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-sm text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${transaction.transaction_type == "CREDIT" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="p-2 text-sm text-gray-700 text-center">
                      {transaction.comment || "-"}
                    </td>
                    <td
                      className={`p-2 text-sm font-bold text-center ${transaction.transaction_type == "CREDIT" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.transaction_type == "CREDIT" ? "+" : "-"} Rs.{" "}
                      {transaction.amount}
                    </td>
                    <td className="p-2 text-sm space-x-2 text-center">
                      <button
                        onClick={() => handlerEdit(transaction)}
                        className="bg-blue-200 hover:bg-blue-300 px-3 py-1 rounded-md text-blue-700 transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button onClick={() => handlerDelete(transaction.id)} className="bg-red-200 hover:bg-red-300 px-3 py-1 rounded-md text-red-700 transition cursor-pointer">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center justify-center p-6">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* pagination */}
        <div className="bg-white p-2 rounded-md flex justify-between items-center shadow-md">
          <button
            disabled={!hasMore.previous}
            onClick={() => fetchData(currentPage - 1)}
            className="px-4 py-2 bg-gray-200 rounded-md font-medium text-gray-700 hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm font-semibold text-gray-600">
            Page {currentPage}
          </span>
          <button
            disabled={!hasMore.next}
            onClick={() => fetchData(currentPage + 1)}
            className="px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
