import express from "express";

const router = express.Router();

router.get("/get", async (req, res) => {
  return res.json({ message: "productsRoute is working."});
});

export default router;
