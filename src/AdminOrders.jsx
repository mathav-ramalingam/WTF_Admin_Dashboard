import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./api/config.jsx";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState("all");
  const [timeSort, setTimeSort] = useState("newest");

  // 🔹 Fetch Orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/getorders`);
      setAllOrders(res.data);
      filterAndSort(res.data, selectedDate, timeSort);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSort(allOrders, selectedDate, timeSort);
  }, [selectedDate, timeSort]);

  // 🔹 Filter by Date + Sort by Time
  const filterAndSort = (data, date, sortType) => {
    let filtered = data;

    if (date !== "all") {
      filtered = data.filter(
        (order) =>
          new Date(order.createdAt).toISOString().split("T")[0] === date
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      const timeA = new Date(a.createdAt);
      const timeB = new Date(b.createdAt);
      return sortType === "newest" ? timeB - timeA : timeA - timeB;
    });

    setOrders(sorted);
  };

  // 🔹 Extract Unique Dates
  const availableDates = [
    ...new Set(
      allOrders.map((order) =>
        new Date(order.createdAt).toISOString().split("T")[0]
      )
    ),
  ];

  const updateStatus = async (id, status) => {
    await axios.put(`${BASE_URL}/getorders/${id}`, { status });
    fetchOrders();
  };

  const updatePayment = async (id, payment) => {
    await axios.put(`${BASE_URL}/getorders/${id}`, { payment });
    fetchOrders();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🚀 What The Food 🫵🤞</h1>

      {/* 🔥 NEW DROPDOWNS (No style changed) */}
      <div style={styles.sortBox}>
        {/* Date Dropdown */}
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.sortSelect}
        >
          <option value="all">All Dates</option>
          {availableDates.map((date, index) => (
            <option key={index} value={date}>
              {date}
            </option>
          ))}
        </select>

        {/* Time Sort Dropdown */}
        <select
          value={timeSort}
          onChange={(e) => setTimeSort(e.target.value)}
          style={{ ...styles.sortSelect, marginLeft: "15px" }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Orders Grid (UNCHANGED) */}
      <div style={styles.grid}>
        {orders.map((order) => {
          const delivered = order.status === "Delivered";

          return (
            <div
              key={order._id}
              style={{
                ...styles.card,
                ...(delivered ? styles.deliveredCard : {}),
              }}
            >
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={{ margin: "6px" }}>{order.name}</h3>
                  <h4 style={styles.subText}>🎓 Roll No: {order.rollNo}</h4>
                  <h4 style={styles.subText}>📞 Contact: {order.contact}</h4>
                </div>

                <span
                  style={{
                    ...styles.statusBadge,
                    background: delivered
                      ? "linear-gradient(45deg,#2ecc71,#2f3032)"
                      : "linear-gradient(45deg,#f39c12,#e67e22)",
                  }}
                >
                  {order.status}
                </span>
              </div>

              <p style={{ marginTop: "8px" }}>
                📍 <b>{order.location}</b>
              </p>

              <p>
                💰 Total:{" "}
                <span style={styles.totalAmount}>
                  ₹{order.totalAmount}
                </span>
              </p>

              <div style={styles.itemsContainer}>
                <h4>🛒 Ordered Items</h4>

                {order.items.map((item, i) => (
                  <div key={i} style={styles.itemRow}>
                    <div style={styles.itemLeft}>
                      <span style={styles.itemName}>
                        {item.name}
                      </span>
                    </div>

                    <div style={styles.quantityBadge}>
                      × {item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.controlBox}>
                <select
                  defaultValue={order.status}
                  id={`status-${order._id}`}
                  style={styles.dropdown}
                >
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                </select>

                <button
                  style={styles.statusBtn}
                  onClick={() =>
                    updateStatus(
                      order._id,
                      document.getElementById(
                        `status-${order._id}`
                      ).value
                    )
                  }
                >
                  🚚 Update Status
                </button>
              </div>

              <div style={styles.controlBox}>
                <select
                  defaultValue={order.payment}
                  id={`payment-${order._id}`}
                  style={styles.dropdown}
                >
                  <option value="Nan">Nan</option>
                  <option value="COD">COD</option>
                  <option value="Gpay">Gpay</option>
                </select>

                <button
                  style={styles.paymentBtn}
                  onClick={() =>
                    updatePayment(
                      order._id,
                      document.getElementById(
                        `payment-${order._id}`
                      ).value
                    )
                  }
                >
                  💳 Update Payment
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const styles = {
  container: {
    margin: "0px",
    paddingTop: "20px",
    paddingBottom: "30px",
    paddingLeft: "30px",
    paddingRight: "30px",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #141e30, #191a1b)",
  },
  heading: {
    textAlign: "center",
    color: "white",
    marginBottom: "30px",
    fontSize: "32px",
  },
  sortBox: {
    textAlign: "center",
    marginBottom: "30px",
  },
  sortSelect: {
    padding: "10px",
    borderRadius: "20px",
    border: "none",
    fontWeight: "bold",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
  },
  card: {
    background: "white",
    borderRadius: "30px",
    padding: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    transition: "0.4s ease",
  },
  deliveredCard: {
    background: "#bdb8b8",
    opacity: 0.6,
    filter: "grayscale(80%)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subText: {
    fontSize: "13px",
    color: "#555",
    margin: "2px 0",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
    fontWeight: "bold",
    fontSize: "12px",
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: "18px",
    color: "#e74c3c",
  },
  itemsContainer: {
    background: "#e3f4df",
    padding: "12px",
    borderRadius: "12px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  itemIcon: {
    fontSize: "18px",
  },
  itemName: {
    fontWeight: "600",
    fontSize: "14px",
  },
  quantityBadge: {
    background: "linear-gradient(45deg,#ff416c,#ff4b2b)",
    color: "white",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  controlBox: {
    marginTop: "15px",
    display: "flex",
    gap: "10px",
  },
  dropdown: {
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  statusBtn: {
    padding: "8px 14px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
    background: "linear-gradient(45deg,#ff416c,#ff4b2b)",
  },
  paymentBtn: {
    padding: "8px 14px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
    background: "linear-gradient(45deg,#8e44ad,#3498db)",
  },
};

export default AdminOrders;
