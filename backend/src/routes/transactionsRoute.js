import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

//Get transactions
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const transaction = await sql`
    SELECT * FROM transactions WHERE user_id =${user_id} ORDER BY created_at DESC
    `;

    res.status(200).json(transaction);
  } catch (error) {
    console.log("Error creating transaction");
    res.status(500).json({ message: "Internal server error" });
  }
});

//Create transactions
router.post("/add", async (req, res) => {
  //title, category, amount, user_id
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !amount || !category || !user_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction = await sql`
        INSERT INTO transactions(user_id,title,amount,category)
        VALUES(${user_id},${title},${amount},${category})
        RETURNING *
        `;

    console.log(transaction);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.log("Error creating transaction");
    res.status(500).json({ message: "Internal server error" });
  }
});

//Delete Transactions
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid Transaction ID" });
    }

    const result = await sql`
    DELETE FROM transactions WHERE id =${id} RETURNING *`;

    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log("Error deleting transaction");
    res.status(500).json({ message: "Internal server error" });
  }
});

//Check balance
router.get("/summary/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const balanceResult = await sql`
    SELECT COALESCE(SUM(amount),0) AS balance FROM transactions WHERE user_id = ${user_id}`;

    const incomeResult = await sql`
    SELECT COALESCE(SUM(amount), 0 ) AS income FROM transactions WHERE user_id = ${user_id} AND amount > 0`;

    const expenseResult = await sql`
    SELECT COALESCE(SUM(amount),0) AS expense FROM transactions WHERE user_id = ${user_id} AND amount < 0`;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expense: expenseResult[0].expense,
    });
  } catch (error) {
    console.log("Error fetching balance");
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

export default router;
